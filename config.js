// config.js (你最新提供的版本，假设你想完全忽略static目录)
module.exports = {
    // 监听的目录路径 (通常通过命令行参数传入，这里作为默认值或备用)
    targetDirectory: './your_project_root',

    // 生成的Markdown文件的输出路径
    outputMarkdownPath: './output/springboot后端项目代码.md',

    // 完全屏蔽的文件或目录（不会出现在文件结构和内容中）
    ignoredPaths: [
        // --- 通用忽略项 ---
        '.DS_Store',            // macOS 系统文件
        '.git/',                // Git 版本控制目录
        '.vscode/',             // VS Code 编辑器配置
        '.idea/',               // IntelliJ IDEA 编辑器配置
        '.project',             // Eclipse 项目文件
        '.classpath',           // Eclipse 类路径文件
        '.settings/',           // Eclipse 项目设置目录
        'Thumbs.db',            // Windows 缩略图缓存
        '*.log',                // 日志文件
        '*.tmp',                // 临时文件
        'temp/',                // 常见临时目录
        'dist/', // 这里重复了，因为下面 JS/TS 也包含了，可以移除一个
        "pnpm-lock.yaml",
        "fonts/",

        // --- JavaScript/TypeScript 项目忽略项 ---
        'node_modules/',        // npm 依赖目录 (非常重要)
        'package-lock.json',    // npm 锁定文件
        'yarn.lock',            // Yarn 锁定文件
        'dist/',                // Webpack/Rollup 等构建工具的输出目录 (保留这个，因为它可能在前端项目根目录)
        'build/',               // 其他构建输出目录
        '.parcel-cache/',       // Parcel 打包工具缓存
        'coverage/',            // 测试覆盖率报告
        '*.map',                // Source Map 文件
        '*.tsbuildinfo',        // TypeScript 构建信息文件
        '.svelte-kit/',         // SvelteKit 构建缓存
        '.next/',               // Next.js 构建输出
        '.nuxt/',               // Nuxt.js 构建输出
        'uni_modules/',         // Uni-App 特定目录
        'unpackage/',           // Uni-App 打包目录
        'wxcomponents/',        // 微信小程序组件

        // --- Java/Spring Boot Maven 项目忽略项 ---
        'target/',              // Maven 构建输出目录 (非常重要)
        '.flattened-pom.xml',   // Maven 扁平化 POM
        '*.iml',                // IntelliJ IDEA 模块文件
        '.mvn/',                // Maven Wrapper 目录
        '**/__Javadoc.json',    // 某些工具生成的 Javadoc JSON
        // '**/impl/*.class',      // 编译后的实现类（可选，如果业务逻辑在接口中定义，请谨慎使用）
        // '**/service/impl/*.class', // 通常 service impl 是核心业务，请根据实际情况决定是否屏蔽
        '**/generated-sources/', // 自动生成的源代码 (如 MapStruct, Lombok 的构建产物)
        '**/generated-test-sources/', // 自动生成的测试源代码
        '**/target/classes/META-INF/', // JAR 包元数据
        '**/target/maven-archiver/', // Maven 归档信息
        '**/target/maven-status/', // Maven 编译状态

        // --- Python 项目忽略项 ---
        '__pycache__/',         // Python 字节码缓存目录
        'venv/',               // 虚拟环境目录 (或 venv/)
        'env/',                 // 另一种虚拟环境目录命名
        '*.pyc',                // Python 编译缓存文件
        '*.pyd',                // Windows 下的 Python 动态库
        '*.so',                 // Linux/macOS 下的 Python 动态库
        '.pytest_cache/',       // Pytest 缓存
        'dist/',                // Python 打包分发目录 (已通用，可删除)
        'build/',               // Python 构建目录 (已通用，可删除)
        '*.egg-info/',          // Python 包信息
        '.mypy_cache/',         // MyPy 缓存
        '.ipynb_checkpoints/',  // Jupyter Notebook 检查点
        'htmlcov/',             // coverage.py 报告
        'poetry.lock',          // Poetry 锁定文件
        'Pipfile.lock',         // Pipenv 锁定文件

        // --- 静态文件/资源目录 (根据你的需求，如果你想完全忽略) ---
        'static/',              // 忽略整个 static 目录及其所有内容
        // 'public/',              // 忽略整个 public 目录
        // 'assets/',              // 如果 assets 目录也主要是不需要文档化的资源，可以考虑

        // swift 项目 忽略
        'FlowAI.xcodeproj/',
        'README.md',
        'tinymce/',
        'views/',
        
    ],

    // 屏蔽文件内容（只在文件结构中显示，内容标记为“已屏蔽”）
    ignoredContentPaths: [
        // --- 通用内容忽略项 ---
        '*.jar',
        '*.zip',
        '*.rar',
        '*.gz',
        '*.tar',
        '*.vscodeignore',
        '.gitignore',

        'pingfang/',
        'm3e/',
        'ner_model_bert/',
        
        // --- 图片和矢量图文件 (保留这些通用规则，以防万一有其他非 ignoredPaths 中的图片) ---
        '*.jpg',
        '*.jpeg',
        '*.png',
        '*.gif',
        '*.bmp',
        '*.ico',
        '*.webp',
        '*.svg',
        '*.avif',

        // --- 项目特定内容忽略项 ---
        "Cargo.lock",
        "schemas/",
        "*.icns",
        'pom.xml',
        'hei-normal.js',
        'auto-imports.d.ts',
        'components.d.ts',
        'gradle.properties',
        'build.gradle',
        'settings.gradle',
        'tsconfig.json',
        'webpack.config.js',
        'rollup.config.js',
        'babel.config.js',
        'tailwind.config.js',
        'next.config.js',
        'nuxt.config.js',
        'pyproject.toml',
        'requirements.txt',
        'Pipfile',
        'Procfile',
        '.env',
        '*.env',
        'uploads/',

        // 敏感信息或大型数据文件
        'big_data_file.txt',
        'credentials.json',
        '*.key',
        '*.pem',
        '*.crt',
        '*.jks',
        '演示使用自行删除/',
    ]
};