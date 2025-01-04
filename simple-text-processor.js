class SimpleTextProcessor {
    constructor() {
        this.expressionsData = null;
    }

    // Base64のURLのエンコード
    encodeBase64URL(str) {
        return btoa(unescape(encodeURIComponent(str)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    // Base64のURLのデコード
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

    // 各種選択肢（発言者、感情、動作、末尾）の値をまとめたメタデータを生成
    createMetadata(user = '0', feel = '0', action = '0', ending = '0') {
        return {
            user: user,
            feel: feel,
            action: action,
            ending: ending
        };
    }

    // テキストとメタデータを組み合わせて共有用URLを生成
    createShareableURL(text, metadata, baseUrl) {
        const encodedText = this.encodeBase64URL(text);
        const metaString = `${metadata.user}${metadata.feel}${metadata.action}${metadata.ending}`;
        return `${baseUrl}view.html#t=${encodedText}&m=${metaString}`;
    }

    // 共有URLからデータを解析
    parseShareableURL(hash) {
        if (!hash) return null;

        try {
            const params = new URLSearchParams(hash.slice(1));
            const encodedText = params.get('t');
            const metadata = params.get('m');

            if (!encodedText) return null;

            return {
                text: this.decodeBase64URL(encodedText),
                metadata: {
                    user: metadata[0] || '0',
                    feel: metadata[1] || '0',
                    action: metadata[2] || '0',
                    ending: metadata[3] || '0'
                }
            };
        } catch (error) {
            console.error('URLの解析に失敗:', error);
            throw new Error('URLの解析に失敗しました');
        }
    }

    // テキストとメタデータを組み合わせて、プレビュー用のテキストを生成
    // 　発言者や感情、動作、末尾を元に追加情報を組み込む。
    formatPreview(text, metadata) {
        if (!this.expressionsData) return text;

        // 全て未設定の場合はテキストのみ返す
        if (metadata.user === '0' && metadata.feel === '0' &&
            metadata.action === '0' && metadata.ending === '0') {
            return text;
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
            return `${text}\n\nと、${parts.join('')}${ending}`;
        }
        // 末尾のみある場合
        else if (ending) {
            return `${text}${ending}`;
        }

        return text;
    }


    // expressions.jsonから式データ（発言者、感情、動作、末尾）を非同期でロード
    // 　ロードに失敗した場合はデフォルト値を返す
    async loadExpressions() {
        try {
            const response = await fetch('./expressions.json');
            this.expressionsData = await response.json();
            return this.expressionsData;
        } catch (error) {
            console.error('式データの読み込みに失敗:', error);
            return {
                users: { '0': '未設定' },
                feels: { '0': '未設定' },
                actions: { '0': '未設定' },
                endings: { '0': '未設定', '1': '。' }
            };
        }
    }
}
