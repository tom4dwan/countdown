// ... existing code ...

// 存储操作的包装函数
const Storage = {
    save: function(data) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(data, () => {
                if (chrome.runtime.lastError) {
                    console.error('存储错误:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('数据保存成功:', data);
                    resolve();
                }
            });
        });
    },
    
    load: function(keys) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(keys, (result) => {
                if (chrome.runtime.lastError) {
                    console.error('读取错误:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('数据读取成功:', result);
                    resolve(result);
                }
            });
        });
    }
};

// 修改 saveSettings 函数
async function saveSettings() {
    try {
        const examDateInput = document.getElementById('examDate');
        if (!examDateInput) {
            throw new Error('找不到日期输入框元素');
        }

        const date = examDateInput.value;
        if (!date) {
            throw new Error('请选择考试日期');
        }

        console.log('正在保存日期:', date);
        
        // 使用 Storage 包装函数保存数据
        await Storage.save({ examDate: date });
        console.log('日期保存成功');
        
        // 更新显示
        updateCountdown();
        
    } catch (error) {
        console.error('保存设置时出错:', error);
        alert('保存失败: ' + error.message);
    }
}

// 修改 loadSettings 函数
async function loadSettings() {
    try {
        const result = await Storage.load(['examDate']);
        const examDateInput = document.getElementById('examDate');
        
        if (examDateInput && result.examDate) {
            console.log('加载到保存的日期:', result.examDate);
            examDateInput.value = result.examDate;
            updateCountdown();
        } else {
            console.log('没有找到保存的日期');
        }
    } catch (error) {
        console.error('加载设置时出错:', error);
    }
}

// 修改 updateCountdown 函数
async function updateCountdown() {
    try {
        const result = await Storage.load(['examDate']);
        const daysLeftElement = document.getElementById('daysLeft');
        
        if (!daysLeftElement) {
            throw new Error('找不到倒计时显示元素');
        }

        if (!result.examDate) {
            daysLeftElement.textContent = '-';
            return;
        }

        const now = new Date();
        const examDate = new Date(result.examDate);
        
        // 设置时间为当天的开始时间
        now.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);
        
        const diffTime = examDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        console.log('日期计算:', {
            now: now.toISOString(),
            examDate: examDate.toISOString(),
            diffDays
        });
        
        daysLeftElement.textContent = diffDays;
        
        // 生成壁纸
        requestAnimationFrame(() => {
            generateWallpaper();
        });
        
    } catch (error) {
        console.error('更新倒计时出错:', error);
    }
}

// 初始化时添加调试信息
document.addEventListener('DOMContentLoaded', () => {
    console.log('插件初始化开始');
    
    // 测试存储权限
    Storage.save({ test: 'test' })
        .then(() => console.log('存储权限正常'))
        .catch(error => console.error('存储权限测试失败:', error));
    
    // 初始化应用
    initialize();
});

function updateCountdown() {
    try {
        console.log('更新倒计时...');
        chrome.storage.sync.get(['examDate'], (result) => {
            const daysLeftElement = document.getElementById('daysLeft');
            if (!daysLeftElement) {
                console.error('找不到倒计时显示元素');
                return;
            }

            if (!result.examDate) {
                daysLeftElement.textContent = '-';
                return;
            }

            // 正确处理日期计算
            const now = new Date();
            const examDate = new Date(result.examDate);
            
            // 设置时间为当天的开始时间（0时0分0秒）
            now.setHours(0, 0, 0, 0);
            examDate.setHours(0, 0, 0, 0);
            
            // 使用 UTC 时间计算天数差，避免时区问题
            const diffTime = examDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            console.log('当前日期:', now.toISOString());
            console.log('考试日期:', examDate.toISOString());
            console.log('相差天数:', diffDays);
            
            daysLeftElement.textContent = diffDays;

            requestAnimationFrame(() => {
                generateWallpaper();
            });
        });
    } catch (error) {
        console.error('更新倒计时出错:', error);
    }
}

// 初始化函数
function initialize() {
    console.log('开始初始化...');
    
    // 确保在 DOM 完全加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM 加载完成');
            setupEventListeners();
        });
    } else {
        console.log('DOM 已经加载');
        setupEventListeners();
    }
}

function setupEventListeners() {
    try {
        console.log('设置事件监听器...');
        
        const elements = {
            examDate: document.getElementById('examDate'),
            downloadBtn: document.getElementById('downloadBtn'),
            canvas: document.getElementById('wallpaperCanvas'),
            daysLeft: document.getElementById('daysLeft')
        };
        
        // 检查所有必要元素
        Object.entries(elements).forEach(([name, element]) => {
            if (!element) {
                throw new Error(`找不到元素: ${name}`);
            }
            console.log(`找到元素: ${name}`);
        });
        
        // 添加事件监听器
        elements.examDate.addEventListener('change', saveSettings);
        elements.downloadBtn.addEventListener('click', downloadWallpaper);
        
        // 初始化 Canvas
        initializeCanvas();
        
        // 加载保存的设置
        loadSettings();
        
        console.log('初始化完成');
        
    } catch (error) {
        console.error('初始化出错:', error);
    }
}

// 日期格式化函数
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 加载设置
function loadSettings() {
    chrome.storage.sync.get(['examDate'], (result) => {
        const examDateInput = document.getElementById('examDate');
        if (examDateInput && result.examDate) {
            // 将 ISO 字符串转换为本地日期格式
            const examDate = new Date(result.examDate);
            const localDate = examDate.toISOString().split('T')[0];
            
            console.log('加载考试日期:', localDate);
            
            examDateInput.value = localDate;
            updateCountdown();
        }
    });
}

// 保存设置
function saveSettings() {
    try {
        const examDateInput = document.getElementById('examDate');
        if (!examDateInput) {
            throw new Error('找不到日期输入框元素');
        }

        const date = examDateInput.value;
        if (!date) {
            throw new Error('请选择考试日期');
        }
        
        // 确保保存的是标准格式的日期字符串
        const examDate = new Date(date);
        examDate.setHours(0, 0, 0, 0);
        
        console.log('保存考试日期:', examDate.toISOString());
        
        chrome.storage.sync.set({
            examDate: examDate.toISOString()
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('保存设置失败:', chrome.runtime.lastError);
                return;
            }
            console.log('设置保存成功');
            updateCountdown();
        });
    } catch (error) {
        console.error('保存设置时出错:', error);
        alert(error.message);
    }
}

// 启动初始化
initialize();

// ... existing code ...

// 确保DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initialize);

function updateCanvasStyle(canvas) {
    if (canvas) {
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
    }
} 

// 壁纸生成配置
const MOTIVATIONAL_QUOTES = [
    { threshold: 30, text: "🏃 每天进步1%，收获几何级成长！" },
    { threshold: 14, text: "🚀 量变终将引发质变！" },
    { threshold: 7, text: "🔥 最后冲刺，错题本是最好伙伴！" },
    { threshold: 3, text: "🎯 你已经比昨天更强大！" },
    { threshold: 1, text: "💪 最后一搏，你可以的！" },
    { threshold: 0, text: "🎉 考试顺利！记得检查姓名！" }
];

// Canvas 初始化函数
function initializeCanvas() {
    const canvas = document.getElementById('wallpaperCanvas');
    if (!canvas) {
        console.error('Canvas 元素不存在');
        return null;
    }
    
    // 设置初始尺寸
    canvas.width = 1080;
    canvas.height = 1920;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('无法获取 Canvas 上下文');
        return null;
    }
    
    return { canvas, ctx };
}

// 修改 generateWallpaper 函数
function generateWallpaper() {
    console.log('开始生成壁纸...');
    
    const canvasSetup = initializeCanvas();
    if (!canvasSetup) {
        console.error('Canvas 初始化失败');
        return;
    }
    
    const { canvas, ctx } = canvasSetup;
    
    try {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 获取倒计时天数
        const daysLeftElement = document.getElementById('daysLeft');
        if (!daysLeftElement) {
            throw new Error('找不到倒计时显示元素');
        }
        console.log('倒计时显示元素:', daysLeftElement);
        // const daysLeft = parseInt(daysLeftElement.textContent);
        const daysLeft = 1;
        // 获取对应的鼓励语
        let motivationalText = '';
        for (const quote of MOTIVATIONAL_QUOTES) {
            if (daysLeft >= quote.threshold) {
                motivationalText = quote.text;
                break;
            }
        }
        
        // 绘制文字
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 绘制主要倒计时数字
        ctx.font = 'bold 200px Arial';
        ctx.fillText(daysLeft, canvas.width/2, canvas.height/2 - 50);
        
        // 绘制"天"字
        ctx.font = 'bold 80px Arial';
        ctx.fillText('天', canvas.width/2, canvas.height/2 + 50);
        
        // 绘制标题文字
        ctx.font = '60px Arial';
        ctx.fillText('距离考试还有', canvas.width/2, canvas.height/2 - 200);
        
        // 绘制鼓励语
        ctx.font = '48px Arial';
        // 处理鼓励语换行
        const maxWidth = canvas.width * 0.8; // 最大宽度为画布宽度的80%
        const words = motivationalText.split('');
        let line = '';
        let y = canvas.height/2 + 200;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && i > 0) {
                ctx.fillText(line, canvas.width/2, y);
                line = words[i];
                y += 60;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvas.width/2, y);
        
        console.log('壁纸生成完成，包含鼓励语：', motivationalText);
        
    } catch (error) {
        console.error('生成壁纸时出错:', error);
    }
}

// 文字自动换行
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';

    for (const [index, word] of words.entries()) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && index > 0) {
            ctx.fillText(line, x, y);
            line = word + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
}

// 自动更新设置
function setupAutoUpdate() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker 注册成功'))
            .catch(err => console.error('Service Worker 注册失败:', err));
    }

    // 每天检查更新
    setInterval(() => {
        chrome.storage.sync.get(['examDate'], (result) => {
            if (result.examDate) generateWallpaper();
        });
    }, 1000 * 60 * 60 * 24); // 24小时检查一次
}

// 初始化加载保存的日期
window.onload = () => {
    chrome.storage.sync.get(['examDate'], (result) => {
        if (result.examDate) {
            document.getElementById('examDate').value = result.examDate.split('T')[0];
            generateWallpaper();
        }
    });
};

function updateCountdown() {
    const now = new Date();
    const examDate = new Date(localStorage.getItem('examDate'));
    
    // 添加时区处理
    examDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    const diff = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    document.getElementById('daysLeft').textContent = diff;
    
    // 更新后立即重新生成壁纸
    generateWallpaper();
}

// 替换 localStorage 为 chrome.storage
function saveSettings() {
    try {
        console.log('保存设置...');
        const date = document.getElementById('examDate').value;
        if (!date) {
            throw new Error('请选择考试日期');
        }
        
        chrome.storage.sync.set({
            examDate: date
        }, () => {
            updateCountdown();
            generateWallpaper();
        });
    } catch (error) {
        alert(error.message);
    }
}

function loadSettings() {
    chrome.storage.sync.get(['examDate'], (result) => {
        if (result.examDate) {
            document.getElementById('examDate').value = result.examDate;
            updateCountdown();
            generateWallpaper();
        }
    });
}

// 修改下载功能
function downloadWallpaper() {
    const canvas = document.getElementById('wallpaperCanvas');
    
    // 确保canvas中有内容
    if (!canvas.getContext) {
        console.error('Canvas not supported');
        return;
    }
    
    canvas.toBlob((blob) => {
        if (!blob) {
            console.error('Failed to create blob');
            return;
        }
        
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
            url: url,
            filename: `countdown-wallpaper-${Date.now()}.png`,
            saveAs: true
        }, () => {
            // 清理URL
            URL.revokeObjectURL(url);
        });
    }, 'image/png');
}

// 添加调试日志
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded 事件触发');
    initialize();
});