// 微博热搜爬虫
export async function getWeiboHot() {
  try {
    // 微博热搜API（公开接口）
    const response = await fetch('https://weibo.com/ajax/side/hotSearch');
    
    if (!response.ok) {
      throw new Error('获取微博热搜失败');
    }

    const data = await response.json();
    
    if (!data.data || !data.data.realtime) {
      throw new Error('微博热搜数据格式错误');
    }

    // 提取前20个热搜
    const hotTopics = data.data.realtime
      .slice(0, 20)
      .map(item => ({
        title: item.word || item.note,
        excerpt: item.word_scheme || '',
        hotValue: item.num || 0,
        category: item.category || '综合',
        source: 'weibo'
      }));

    return hotTopics;

  } catch (error) {
    console.error('微博热搜获取失败:', error.message);
    
    // 返回备用数据
    return [
      { 
        title: '社会热点话题示例1', 
        excerpt: '这是一个关于社会现象的话题',
        source: 'weibo',
        hotValue: 1000000
      },
      { 
        title: '情感观察话题示例2', 
        excerpt: '这是一个关于人性的话题',
        source: 'weibo',
        hotValue: 900000
      }
    ];
  }
}
