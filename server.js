// server.js
const chokidar = require('chokidar');
const fs = require('fs-extra');
const path = require('path');
const config = require('./config');

// 从命令行参数获取目标目录
const commandLineTargetDir = process.argv[2];
// 从命令行参数获取输出Markdown文件路径
const commandLineOutputMarkdownPath = process.argv[3];

// 确定最终的 targetDirectory：命令行参数 > config.js 中的配置
const targetDirectory = commandLineTargetDir || config.targetDirectory;

// 确定最终的 outputMarkdownPath：命令行参数 > config.js 中的配置
const outputMarkdownPath = commandLineOutputMarkdownPath || config.outputMarkdownPath;

const { ignoredPaths, ignoredContentPaths } = config;

// 确保目标目录存在，否则会报错
if (!fs.existsSync(targetDirectory)) {
    console.error(`错误：目标目录 "${targetDirectory}" 不存在。请检查命令行参数或 config.js 中的 targetDirectory 配置。`);
    process.exit(1);
}

/**
 * 辅助函数：检查一个路径是否应该被忽略
 * @param {string} relativePath - 相对于 targetDirectory 的路径
 * @param {string} fileName - 当前文件的名称（不包含路径）
 * @param {string[]} ignoreList - 忽略列表 (ignoredPaths 或 ignoredContentPaths)
 * @returns {boolean} - 如果路径应该被忽略，则返回 true
 * @description
 * 此函数基于原子设计原则，将路径忽略逻辑分解为最小单元。
 * 它能处理目录的任意层级匹配，以及文件的精确或通配符匹配。
 * 对于文件规则，它会将简单的通配符（如 '*.png'）转换为正则表达式，以实现灵活的匹配。
 */
function isPathIgnored(relativePath, fileName, ignoreList) {
    const pathParts = relativePath.split(path.sep);
    const listName = ignoreList === ignoredPaths ? 'ignoredPaths' : 'ignoredContentPaths'; // 用于日志
    let matchedRule = null; // 存储匹配到的规则

    const shouldIgnore = ignoreList.some(p => {
        let normalizedP = p.startsWith('./') ? p.substring(2) : p;

        const isRuleADirectory = normalizedP.endsWith('/');
        if (isRuleADirectory) {
            normalizedP = normalizedP.substring(0, normalizedP.length - 1); // 移除尾部斜杠
            // 检查相对路径的任何一个部分是否与被忽略的目录名匹配
            const match = pathParts.some(part => part === normalizedP);
            if (match) {
                matchedRule = p; // 记录匹配到的规则
            }
            return match;
        } else {
            // 如果规则是文件 (如 '.DS_Store', 'pom.xml', 或 '*.png')
            // [修复] 将简单的通配符模式转换为正则表达式以进行匹配。
            // 这使得像 '*.png' 这样的规则可以正常工作。
            // 我们将 '*' 替换为 '.*' (匹配任意数量的任意字符), 将 '.' 替换为 '\.' (匹配字面上的点)。
            const regexPattern = '^' + normalizedP.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
            const regex = new RegExp(regexPattern);
            const match = regex.test(fileName); // 使用正则表达式测试文件名

            if (match) {
                matchedRule = p; // 记录匹配到的规则
            }
            return match;
        }
    });

    // 为了调试方便，保留日志输出
    if (shouldIgnore) {
        // console.log(`[DEBUG] Path "${relativePath}" (file: "${fileName}") is ${listName === 'ignoredPaths' ? 'COMPLETELY IGNORED' : 'CONTENT IGNORED'} by rule "${matchedRule}"`);
    }
    return shouldIgnore;
}


/**
 * 递归获取目录结构
 * @param {string} dir - 当前目录路径
 * @param {string} prefix - 树形结构前缀
 * @returns {string} - 格式化后的目录结构字符串
 */
async function getDirectoryStructure(dir, prefix = '') {
    let structure = '';
    const files = await fs.readdir(dir);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = path.join(dir, file);
        const relativePath = path.relative(targetDirectory, filePath);

        // 使用辅助函数检查是否应该完全忽略
        if (isPathIgnored(relativePath, file, ignoredPaths)) {
            continue; // 跳过被忽略的文件或目录
        }

        const stats = await fs.stat(filePath);
        const isLast = i === files.length - 1;
        const currentPrefix = prefix + (isLast ? '└── ' : '├── ');

        structure += `${currentPrefix}${file}\n`;

        if (stats.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            structure += await getDirectoryStructure(filePath, newPrefix);
        }
    }
    return structure;
}

/**
 * 递归读取文件内容
 * @param {string} dir - 当前目录路径
 * @param {string[]} contents - 存储文件内容的数组
 */
async function getFileContents(dir, contents = []) {
    const files = await fs.readdir(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const relativePath = path.relative(targetDirectory, filePath);

        // 检查是否应该完全忽略 (ignoredPaths)
        if (isPathIgnored(relativePath, file, ignoredPaths)) {
            continue;
        }

        const stats = await fs.stat(filePath);

        if (stats.isFile()) {
            // 检查是否在 ignoredContentPaths 中（只忽略内容）
            const shouldIgnoreContent = isPathIgnored(relativePath, file, ignoredContentPaths);

            if (!shouldIgnoreContent) {
                const content = await fs.readFile(filePath, 'utf8');
                // 尝试根据文件扩展名添加代码块语言
                const ext = path.extname(file).substring(1); // 获取扩展名，去除前导点
                let language = ext;
                // 语言映射表
                const langMap = {
                    js: 'javascript', jsx: 'javascript',
                    ts: 'typescript', tsx: 'typescript',
                    py: 'python', java: 'java',
                    json: 'json', html: 'html',
                    css: 'css', scss: 'scss',
                    vue: 'vue', md: 'markdown',
                    sh: 'bash', yml: 'yaml',
                    xml: 'xml'
                };
                language = langMap[ext] || ext;

                contents.push(`\n### ${relativePath}\n\n\`\`\`${language}\n${content}\n\`\`\`\n`);
            } else {
                contents.push(`\n### ${relativePath}\n\n*(内容已屏蔽)*\n`);
            }
        } else if (stats.isDirectory()) {
            await getFileContents(filePath, contents);
        }
    }
    return contents;
}

/**
 * 生成完整的Markdown文档
 */
async function generateMarkdown() {
    console.log('正在生成 Markdown 文档...');
    try {
        const outputDir = path.dirname(outputMarkdownPath);
        await fs.ensureDir(outputDir); // 确保输出目录存在，如果不存在则创建

        const directoryStructure = await getDirectoryStructure(targetDirectory);
        const fileContentsArray = await getFileContents(targetDirectory);
        const fileContents = fileContentsArray.join('');

        const rootDirName = path.basename(targetDirectory);

        const markdownContent = `# 项目文档

## 项目的文件结构

\`\`\`
${rootDirName}
${directoryStructure}
\`\`\`

---

## 项目内容
${fileContents}
`;
        await fs.writeFile(outputMarkdownPath, markdownContent, 'utf8');
        console.log(`Markdown 文档已更新：${outputMarkdownPath}`);
    } catch (error) {
        console.error('生成 Markdown 文档时出错：', error);
    }
}

// 初始化时生成一次
generateMarkdown();

// 监听文件变化
const watcher = chokidar.watch(targetDirectory, {
    ignored: (itemPath) => {
        const relativePath = path.relative(targetDirectory, itemPath);
        if (relativePath === '') return false; // 不忽略根目录本身

        const fileName = path.basename(itemPath); // 获取文件名用于匹配
        // Chokidar 的 ignored 选项只接受一个函数，这个函数应该判断是否完全忽略
        // 所以这里只使用 ignoredPaths 列表
        return isPathIgnored(relativePath, fileName, ignoredPaths);
    },
    ignoreInitial: true,
    persistent: true,
    depth: undefined
});

watcher
    .on('add', (path) => {
        console.log(`文件/目录新增: ${path}`);
        generateMarkdown();
    })
    .on('change', (path) => {
        console.log(`文件内容更新: ${path}`);
        generateMarkdown();
    })
    .on('unlink', (path) => {
        console.log(`文件/目录删除: ${path}`);
        generateMarkdown();
    })
    .on('addDir', (path) => {
        console.log(`目录新增: ${path}`);
        generateMarkdown();
    })
    .on('unlinkDir', (path) => {
        console.log(`目录删除: ${path}`);
        generateMarkdown();
    })
    .on('error', (error) => console.error(`监听器错误: ${error}`));

console.log(`正在监听目录: ${targetDirectory}`);
console.log(`输出 Markdown 到: ${outputMarkdownPath}`);
console.log('按 Ctrl+C 停止服务');
