const fs = require('fs');
const path = require('path');
const themeColor = '#458d6f';
let colorMap = {};

function ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function copyIcon(sourceDir, targetDir) {
    ensureDirSync(targetDir);
    const files = fs.readdirSync(sourceDir);
    files.forEach((file) => {
        const sourceFile = path.join(sourceDir, file);
        const targetFile = path.join(targetDir, file);
        const content = fs.readFileSync(sourceFile, "utf8");
        const icon = path.basename(sourceFile).replace('.svg', '');
        const color = colorMap[icon] || themeColor;
        fs.writeFileSync(targetFile, content.replace(/currentColor/ig, color));
    });
}

function extractGroup() {
    const filePath = path.join(__dirname, '../packages/reference/README.md');
    const data = fs.readFileSync(filePath, 'utf8');

    // 正则表达式匹配##和<!--rehype:class=home-card-->之间的内容
    const regex = /##\s*(.+?)\n([\s\S]*?)<!--rehype:class=home-card-->/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)<!--rehype:style=background:\s*(rgb\(\d+\s+\d+\s+\d+\));/g;
    const iconReg = /docs\/(.*?)\.md/;
    const matches = [];
    let match;
    while ((match = regex.exec(data)) !== null) {
        const title = match[1].trim();
        if (title.startsWith('正在建设中')) continue;
        const content = match[2];
        let linkMatch;
        const links = [];
        let iconMatch;

        while ((linkMatch = linkRegex.exec(content)) !== null) {
            links.push({
                name: linkMatch[1],
                link: linkMatch[2],
            });
            iconMatch = linkMatch[2].match(iconReg);
            if (iconMatch) {
                colorMap[iconMatch[1]] = linkMatch[3];
            }
        }

        matches.push({ title, links });
    }
    // 将匹配结果写入JSON文件
    const dataDir = path.join(__dirname, "../data");
    ensureDirSync(dataDir);
    const outputFilePath = path.join(dataDir, 'group.json');
    groupData = matches;
    fs.writeFileSync(outputFilePath, JSON.stringify(matches, null));
    console.log('更新data/group.json');
}

function extractIcons() {
    const sourceDir = path.resolve(__dirname, "../packages/reference/assets");
    const targetDir = path.resolve(__dirname, "../icons");
    copyIcon(sourceDir, targetDir);
    console.log('复制图标');
}

extractGroup();
extractIcons();
