class SimpleTextProcessor {
    constructor() {
        this.expressionsData = null;
        // マークアップ記号のマッピング
        this.markupMap = {
            '||': '!SP:',    // Spoiler
            '```': '!CB:',   // Code block
            '`': '!CO:',     // Code inline
            '**': '!BO:',    // Bold
            '__': '!IT:',     // Italic
            '>': '!QT:'      // Quote
        };
        // 逆マッピング
        this.reverseMarkupMap = {
            '!SP:': '||',
            '!CB:': '```',
            '!CO:': '`',
            '!BO:': '**',
            '!IT:': '__',
            '!QT:': '>'
        };
    }

    // URLセーフエンコーディング（日本語文字をそのまま保持）
    encodeURLSafe(str) {
        // 日本語やひらがな・カタカナはエンコードせず、URLで問題になる特殊文字のみエンコード
        return str.split('').map(char => {
            // 英数字、ひらがな、カタカナ、漢字などはそのまま
            if (/[A-Za-z0-9\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(char)) {
                return char;
            }
            // スペースは+に
            if (char === ' ') {
                return '+';
            }
            // これらの特殊文字はそのまま
            if ([',', ':', ';'+'.'].includes(char)) {
                return char;
            }
            // それ以外の特殊文字はエンコード
            return encodeURIComponent(char);
        }).join('');
    }

    // URLセーフデコーディング（日本語文字対応）
    decodeURLSafe(str) {
        try {
            // エンコードされた形式 (%XX) が含まれているかチェック
            if (/%[0-9A-F]{2}/i.test(str)) {
                return decodeURIComponent(str.replace(/\+/g, ' '));
            }
            // 日本語や英数字が含まれている場合、そのまま返す（既にデコード済みとみなす）
            if (/[A-Za-z0-9\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(str)) {
                return str.replace(/\+/g, ' ');
            }
            // その他の場合もデコードを試みる
            return decodeURIComponent(str.replace(/\+/g, ' '));
        } catch (e) {
            console.error('デコードエラー:', e);
            return str; // フォールバックとして入力そのままを返す
        }
    }

    // Base64エンコーディング（従来のメソッド、互換性のために残す）
    encodeBase64URL(str) {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    // Base64デコーディング（従来のメソッド、互換性のために残す）
    decodeBase64URL(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
            str += '=';
        }
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            throw new Error('不正なエンコーディングです');
        }
    }

    // 各種選択肢のメタデータを生成
    createMetadata(user = '0', feel = '0', action = '0', ending = '0') {
        return {
            user: user,
            feel: feel,
            action: action,
            ending: ending
        };
    }

    // リッチテキスト記号を置換する処理（新しい方法）
    escapeMarkupSymbols(text) {
        if (!this.containsMarkupSymbols(text)) {
            return { text, hasMarkup: false };
        }

        let result = text;

        // パターンごとに置換処理
        const patterns = [
            { regex: /\|\|(.*?)\|\|/g, start: '||', end: '||' },
            { regex: /```([\s\S]*?)```/g, start: '```', end: '```' },
            { regex: /`([^`]+)`/g, start: '`', end: '`' },
            { regex: /\*\*(.*?)\*\*/g, start: '**', end: '**' },
            { regex: /\__(.*?)\__/g, start: '__', end: '__' },
            // 行頭の > だけを置換する特殊処理
            { regex: /^>\s*(.*?)$/gm, start: '>', end: '' }
        ];

        for (const pattern of patterns) {
            result = result.replace(pattern.regex, (match, content) => {
                const startEsc = this.markupMap[pattern.start] || pattern.start;
                const endEsc = pattern.end ? (this.markupMap[pattern.end] || pattern.end) : '';
                return startEsc + content + endEsc;
            });
        }

        return { text: result, hasMarkup: true };
    }

    // 置換されたリッチテキスト記号を元に戻す処理
    unescapeMarkupSymbols(text) {
        let result = text;

        // 置換された記号を元に戻す
        Object.entries(this.reverseMarkupMap).forEach(([escaped, original]) => {
            const regex = new RegExp(escaped, 'g');
            result = result.replace(regex, original);
        });

        return result;
    }

    // テキストにリッチテキスト記号が含まれているか確認
    containsMarkupSymbols(text) {
        // リッチテキスト記号パターン
        const patterns = [
            /\|\|.*?\|\|/,       // スポイラー
            /```[\s\S]*?```/,    // コードブロック
            /`[^`]+`/,           // インラインコード
            /\*\*.*?\*\*/,       // ボールド
            /\__.*?\__/,           // イタリック
            /^>\s*.*$/m          // 引用（行頭のみ）
        ];

        return patterns.some(pattern => pattern.test(text));
    }

    // // Ver2_テキストにリッチテキスト記号が含まれているか確認（test）
    // containsMarkupSymbols(text) {
    //     const patterns = [
    //         /\|\|.*?\|\|/,       // スポイラー
    //         /```[\s\S]*?```/,    // コードブロック
    //         /`[^`\n]+`/,         // インラインコード (改行を含まないよう修正)
    //         /\*\*[^*]+\*\*/,     // ボールド (ネスト対応はしていない)
    //         /(?:^|[^_])_[^_]+_(?:[^_]|$)/, // イタリック (前後がアンダースコアでないことを確認)
    //         /^>\s.+/m            // 引用 (少なくとも1文字あることを確認)
    //     ];
    //
    //     return patterns.some(pattern => pattern.test(text));
    // }



    // URL生成前にテキストを処理
    createShareableURL(text, metadata, useBase64 = true, title = '') {
        const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '/');

        // リッチテキスト記号の処理
        const { text: processedText, hasMarkup } = this.escapeMarkupSymbols(text);

        // エンコード
        const encodedText = useBase64 ?
            this.encodeBase64URL(processedText) :
            this.encodeURLSafe(processedText);

        // タイトルのエンコード
        const { text: processedTitle, hasMarkup: titleHasMarkup } = title ?
            this.escapeMarkupSymbols(title) : { text: '', hasMarkup: false };

        const encodedTitle = title ?
            (useBase64 ? this.encodeBase64URL(processedTitle) : this.encodeURLSafe(processedTitle)) : '';

        const metaString = `${metadata.user}|${metadata.feel}|${metadata.action}|${metadata.ending}`;
        const encodingFlag = useBase64 ? 'b' : 'u'; // エンコード方式のフラグ
        const markupFlag = hasMarkup || titleHasMarkup ? 'm1' : 'm0'; // マークアップ置換フラグ

        // タイトルがある場合はURLに追加
        const titleParam = encodedTitle ? `&t=${encodedTitle}` : '';

        return `${baseUrl}view.html#${encodingFlag}=${encodedText}${titleParam}&${markupFlag}&m=${metaString}`;
    }

    // URL解析時にテキストを処理
    parseShareableURL(hash) {
        if (!hash) return null;

        try {
            // #以降の部分を解析
            const parts = hash.slice(1).split('&');
            let textPart = '';
            let titlePart = '';
            let metadataPart = '';
            let isBase64 = false;
            let hasMarkup = false;

            for (const part of parts) {
                if (part.startsWith('b=')) {
                    // Base64エンコード (テキスト)
                    textPart = this.decodeBase64URL(part.substring(2));
                    isBase64 = true;
                } else if (part.startsWith('u=')) {
                    // UTF-8直接エンコード (テキスト)
                    textPart = this.decodeURLSafe(part.substring(2));
                } else if (part.startsWith('t=')) {
                    // タイトル部分
                    titlePart = isBase64 ?
                        this.decodeBase64URL(part.substring(2)) :
                        this.decodeURLSafe(part.substring(2));
                } else if (part.startsWith('m=')) {
                    metadataPart = part.substring(2);
                } else if (part === 'm1') {
                    hasMarkup = true;
                }
            }

            if (!textPart) return null;

            // マークアップ記号が置換されている場合は元に戻す
            if (hasMarkup) {
                textPart = this.unescapeMarkupSymbols(textPart);
                if (titlePart) {
                    titlePart = this.unescapeMarkupSymbols(titlePart);
                }
            }

            const metadataParts = metadataPart.split('|');
            return {
                text: textPart,
                title: titlePart || '',
                metadata: {
                    user: this.expressionsData && metadataParts[0] ?
                        (this.expressionsData.users[metadataParts[0]] || '') : '',
                    feel: this.expressionsData && metadataParts[1] ?
                        (this.expressionsData.feels[metadataParts[1]] || '') : '',
                    action: this.expressionsData && metadataParts[2] ?
                        (this.expressionsData.actions[metadataParts[2]] || '') : '',
                    ending: this.expressionsData && metadataParts[3] ?
                        (this.expressionsData.endings[metadataParts[3]] || '') : ''
                }
            };

        } catch (error) {
            console.error('URLの解析に失敗:', error);
            throw new Error('URLの解析に失敗しました');
        }
    }

    // Disc*rd風のHTMLフォーマット処理
    formatToHTML(text) {
        let formatted = text;
        formatted = formatted.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler" style="color: transparent">$1</span>');
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="code-block">$1</pre>');
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>');
        const lines = formatted.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('>')) {
                lines[i] = '<div class="quote">' + lines[i].trim().substring(1).trim() + '</div>';
            }
        }
        formatted = lines.join('\n');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        return formatted;
    }

    // テキストにフォーマットを適用
    applyFormat(text, format, start, end) {
        const selectedText = text.substring(start, end);
        const isAlreadyFormatted = this.checkIfAlreadyFormatted(selectedText, format);
        let formattedText = '';

        if (isAlreadyFormatted) {
            formattedText = this.removeFormat(selectedText, format);
        } else {
            switch (format) {
                case 'bold': formattedText = `**${selectedText}**`; break;
                case 'italic': formattedText = `*${selectedText}*`; break; // _ から * に変更
                case 'spoiler': formattedText = `||${selectedText}||`; break;
                case 'code': formattedText = `\`${selectedText}\``; break;
                case 'codeblock': formattedText = `\`\`\`\n${selectedText}\n\`\`\``; break;
                case 'quote':
                    const lines = selectedText.split('\n');
                    formattedText = lines.map(line => `> ${line}`).join('\n');
                    break;
            }
        }

        return {
            text: text.substring(0, start) + formattedText + text.substring(end),
            newStart: start,
            newEnd: start + formattedText.length
        };
    }

    checkIfAlreadyFormatted(text, format) {
        switch (format) {
            case 'bold': return text.startsWith('**') && text.endsWith('**');
            case 'italic': return text.startsWith('*') && text.endsWith('*') && !text.startsWith('**'); // _ から * に変更
            case 'spoiler': return text.startsWith('||') && text.endsWith('||');
            case 'code': return text.startsWith('`') && text.endsWith('`') && !text.startsWith('```');
            case 'codeblock': return text.startsWith('```') && text.endsWith('```');
            case 'quote': return text.split('\n').every(line => line.trim().startsWith('>'));
            default: return false;
        }
    }

    removeFormat(text, format) {
        switch (format) {
            case 'bold': return text.slice(2, -2);
            case 'italic': return text.slice(1, -1); // _ から * に合わせる
            case 'spoiler': return text.slice(2, -2);
            case 'code': return text.slice(1, -1);
            case 'codeblock':
                if (text.startsWith('```\n') && text.endsWith('\n```')) return text.slice(4, -4);
                return text.slice(3, -3);
            case 'quote': return text.split('\n').map(line => line.replace(/^>\s*/, '')).join('\n');
            default: return text;
        }
    }

    // URL生成とクリップボードコピー
    async generateShareURL(text, metadata, useBase64, title = '') {
        if (!text.trim()) throw new Error('テキストを入力してください。');
        const url = this.createShareableURL(text, metadata, useBase64, title);
        try {
            await navigator.clipboard.writeText(url);
            return { url, message: '共有URLをクリップボードにコピーしました！' };
        } catch (err) {
            throw new Error('URLのコピーに失敗しました: ' + url);
        }
    }

    // URL長さ比較
    getURLLengthComparison(text, metadata, title = '') {
        if (!text.trim()) return '';
        const utf8Url = this.createShareableURL(text, metadata, false, title);
        const base64Url = this.createShareableURL(text, metadata, true, title);
        const utf8Length = utf8Url.length;
        const base64Length = base64Url.length;
        const diff = base64Length - utf8Length;
        const percent = ((base64Length / utf8Length) * 100 - 100).toFixed(0);
        return `URL長さ比較: 日本語そのまま ${utf8Length}文字 vs Base64 ${base64Length}文字 (${diff > 0 ? '+' : ''}${diff}文字, ${percent}% ${diff > 0 ? '長い' : '短い'})`;
    }

    // テキストとメタデータを組み合わせて、プレビュー用のテキストを生成
    formatPreview(text, metadata, title = '') {
        if (!this.expressionsData) return text;

        // タイトルがある場合、テキストの先頭に追加
        let result = text;
        if (title && title.trim()) {
            result = `【${title}】\n\n${result}`;
        }

        // 全て未設定の場合はテキストのみ返す
        if (metadata.user === '0' && metadata.feel === '0' &&
            metadata.action === '0' && metadata.ending === '0') {
            return result;
        }

        let parts = [];

        // 未設定でない場合のみ追加
        if (metadata.user !== '0') {
            parts.push(this.expressionsData.users[metadata.user]);
        }
        if (metadata.feel !== '0') {
            parts.push(this.expressionsData.feels[metadata.feel]);
        }
        if (metadata.action !== '0') {
            parts.push(this.expressionsData.actions[metadata.action]);
        }

        // 末尾の処理
        const ending = metadata.ending !== '0' ?
            this.expressionsData.endings[metadata.ending] : '';

        // 発言者情報がある場合
        if (parts.length > 0) {
            return `${result}\n\nと、${parts.join('')}${ending}`;
        }
        // 末尾のみある場合
        else if (ending) {
            return `${result}${ending}`;
        }

        return result;
    }

    // expressions.jsonから式データを非同期でロード
    async loadExpressions() {
        try {
            const response = await fetch('./expressions.json');
            this.expressionsData = await response.json();
            return this.expressionsData;
        } catch (error) {
            console.error('式データの読み込みに失敗:', error);
            return {
                users: { '0': ' ' },
                feels: { '0': ' ' },
                actions: { '0': ' ' },
                endings: { '0': ' ', '1': '。' }
            };
        }
    }
}
