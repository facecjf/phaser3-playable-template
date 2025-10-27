export default class Languages {
    constructor(scene) {
        this.scene = scene;
        this.currentLanguage = 'en-us'; // Default language
    }

    getLanguageData(language) {
        this.languageData = {
            'en-us': {
                'play_now': 'PLAY NOW',
                'game_tut': 'TUTORIAL MESSAGE!',
                'test_text': 'WEB FONT TEXT',
                'fontSize': '48px'
            },
            'es-es': {
                'play_now': 'JUEGA\nAHORA',
                'game_tut': '¡MENSAJE TUTORIAL!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'es-mx': {
                'play_now': 'JUEGA\nAHORA',
                'game_tut': '¡MENSAJE TUTORIAL!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'fr-fr': {
                'play_now': 'JOUER\nMAINTENANT',
                'game_tut': 'MESSAGE DU TUTORIEL !',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'it-it': {
                'play_now': 'GIOCA ORA',
                'game_tut': 'MESSAGGIO DEL TUTORIAL!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'pt-br': {
                'play_now': 'JOGUE AGORA',
                'game_tut': 'MENSAGEM DO TUTORIAL!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'ru-ru': {
                'play_now': 'ИГРАТЬ СЕЙЧАС',
                'game_tut': 'ОБУЧАЮЩЕЕ СООБЩЕНИЕ!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'tr-tr': {
                'play_now': 'ŞİMDİ OYNA',
                'game_tut': 'ÖĞRETICI MESAJ!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'ja-jp': {
                'play_now': '今すぐプレイ',
                'game_tut': 'チュートリアルメッセージ!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            },
            'ko-kr': {
                'play_now': '지금 플레이',
                'game_tut': '튜토리얼 메시지!',
                'test_text': 'TEXTO DE PRUEBA',
                'fontSize': '48px'
            }
        }
        if (this.languageData && this.languageData[language]) {
            return this.languageData[language];
        }
        return this.languageData["en-us"]; // Fallback to English if translation not found
    }
};