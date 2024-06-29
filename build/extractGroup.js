const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../packages/reference/README.md');
const data = fs.readFileSync(filePath, 'utf8');

// 正则表达式匹配##和<!--rehype:class=home-card-->之间的内容
const regex = /##\s*(.+?)\n([\s\S]*?)<!--rehype:class=home-card-->/g;
const matches = [];
let match;
while ((match = regex.exec(data)) !== null) {
    const title = match[1].trim();
    if (title.startsWith('正在建设中')) continue;
    const content = match[2];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch;
    const links = [];

    while ((linkMatch = linkRegex.exec(content)) !== null) {
        links.push({
            name: linkMatch[1],
            link: linkMatch[2],
        });
    }

    matches.push({ title, links });
}
// 将匹配结果写入JSON文件
const outputFilePath = path.join(__dirname, '../data/group.json');
fs.writeFileSync(outputFilePath, JSON.stringify(matches, null));
console.log('更新data/group.json');
