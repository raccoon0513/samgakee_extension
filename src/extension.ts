import * as vscode from 'vscode';

// 전역 변수로 현재 WebView 패널을 저장하여 하나만 열리도록 관리합니다.
let currentPanel: vscode.WebviewPanel | undefined = undefined;

//gif route
const gif_route = "\media\samgakee-unscreen.gif"
export function activate(context: vscode.ExtensionContext) {
    console.log('GIF Pet extension "samgakee" is now active.');

    // package.json에 정의된 명령어 ID 'samgakee.create'에 WebView 생성 함수를 연결합니다.
    let disposable = vscode.commands.registerCommand('samgakee.create', () => {
        // 이미 패널이 열려있으면 해당 패널을 다시 활성화합니다.
        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.One); 
            return;
        }

        // 1. 새 WebView 패널 생성
        currentPanel = vscode.window.createWebviewPanel(
            'gifPet', 
            'GIF Pet', 
            vscode.ViewColumn.One, // 현재 활성 에디터 옆에 패널 표시
            {
                enableScripts: true, 
                // media 폴더에 접근할 수 있도록 경로 허용
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')]
            }
        );

        // 2. WebView에 표시할 HTML 콘텐츠 설정 (webview 객체를 전달하여 안전하게 URI 생성)
        currentPanel.webview.html = getWebviewContent(context, currentPanel.webview);

        // 3. 패널이 닫힐 때 currentPanel 변수를 초기화합니다.
        currentPanel.onDidDispose(
            () => {
                currentPanel = undefined;
            },
            null,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

// WebView에 들어갈 HTML 콘텐츠를 생성하는 함수
// 'currentPanel is undefined' 오류를 방지하기 위해 webview 객체를 직접 받습니다.
function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview) {
    // GIF 파일 경로: media/samgakee-unscreen.gif 에 맞춰 URI를 만듭니다.
    //samgakee\media\samgakee-unscreen.gif
    const gifPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'samgakee-unscreen.gif');
    const gifSrc = webview.asWebviewUri(gifPath).toString(); 

    // HTML, CSS (움직임 및 투명 배경), JavaScript (애니메이션 루프)
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GIF Pet</title>
        <style>
            body {
                margin: 0;
                padding: 0;
                overflow: hidden; 
                background-color: transparent !important; /* WebView 배경 투명 */
            }
            #gif-container {
                position: absolute; 
                z-index: 1000; 
                pointer-events: none; /* 클릭-스루 */
            }
            #gif-container img {
                width: 150px; /* GIF 크기 조절 */
                height: auto;
            }
        </style>
    </head>
    <body>
        <div id="gif-container">
            <img src="${gifSrc}" />
        </div>
        <script>
            const gifContainer = document.getElementById('gif-container');
            
            let x = Math.random() * (window.innerWidth - 150); 
            let y = Math.random() * (window.innerHeight - 150); 

            let dx = 2; // X축 이동 속도
            let dy = 2; // Y축 이동 속도
            
            function animateGif() {
                const gifWidth = gifContainer.offsetWidth;
                const gifHeight = gifContainer.offsetHeight;

                const maxX = window.innerWidth - gifWidth;
                const maxY = window.innerHeight - gifHeight;

                if (x >= maxX || x <= 0) {
                    dx = -dx;
                }
                if (y >= maxY || y <= 0) {
                    dy = -dy;
                }

                x += dx;
                y += dy;
                gifContainer.style.left = x + 'px';
                gifContainer.style.top = y + 'px';

                requestAnimationFrame(animateGif); 
            }

            window.addEventListener('resize', () => {
                const gifWidth = gifContainer.offsetWidth;
                const gifHeight = gifContainer.offsetHeight;
                x = Math.min(Math.max(x, 0), window.innerWidth - gifWidth);
                y = Math.min(Math.max(y, 0), window.innerHeight - gifHeight);
            });

            animateGif(); 
        </script>
    </body>
    </html>`;
}

export function deactivate() {}