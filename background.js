// 设置每日更新闹钟
chrome.alarms.create('dailyUpdate', {
  periodInMinutes: 1440 // 24小时
});

// 监听闹钟事件
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyUpdate') {
    updateWallpaper();
  }
});

// 更新壁纸
async function updateWallpaper() {
  try {
    // 从 chrome.storage 获取考试日期
    const data = await chrome.storage.sync.get(['examDate']);
    if (!data.examDate) return;

    // 计算剩余天数
    const now = new Date();
    const examDate = new Date(data.examDate);
    const diff = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));

    // 通知用户
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: '倒计时更新',
      message: `距离考试还有 ${diff} 天`
    });
  } catch (error) {
    console.error('更新失败:', error);
  }
} 