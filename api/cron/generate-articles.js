import { supabase } from '../../utils/supabase.js';
import { generateArticle, selectTopics } from '../../services/ai-writer.js';
import { formatCompleteArticle } from '../../services/formatter.js';

export default async function handler(req, res) {
  console.log('开始每日文章生成任务...');

  try {
    // 模拟热点数据（实际应该调用热点API）
    const mockTopics = [
      { title: '测试热点话题1', excerpt: '这是一个测试话题', source: 'manual' },
      { title: '测试热点话题2', excerpt: '这是另一个测试话题', source: 'manual' }
    ];

    console.log('正在智能选题...');
    const selectedTopics = await selectTopics(mockTopics, 2);
    console.log(`已选择 ${selectedTopics.length} 个话题进行创作`);

    const generatedArticles = [];
    
    for (let i = 0; i < selectedTopics.length; i++) {
      const topic = selectedTopics[i];
      console.log(`正在生成第 ${i + 1} 篇文章：${topic.title}`);

      try {
        const article = await generateArticle(topic);
        const formatted = formatCompleteArticle(article);

        const { data, error } = await supabase
          .from('articles')
          .insert({
            title: formatted.title,
            content: formatted.content,
            formatted_content: formatted.formattedContent,
            preview: formatted.preview,
            word_count: formatted.wordCount,
            estimated_read_time: formatted.estimatedReadTime,
            hot_topic: topic.title,
            source: topic.source,
            status: 'draft',
            generated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        generatedArticles.push(data);
        console.log(`✓ 第 ${i + 1} 篇文章已生成并保存`);
        
        if (i < selectedTopics.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`生成第 ${i + 1} 篇文章失败:`, error.message);
      }
    }

    console.log(`任务完成！共生成 ${generatedArticles.length} 篇文章`);

    return res.status(200).json({
      success: true,
      message: `成功生成 ${generatedArticles.length} 篇文章`,
      articles: generatedArticles.map(a => ({
        id: a.id,
        title: a.title,
        preview: a.preview,
        wordCount: a.word_count
      }))
    });

  } catch (error) {
    console.error('任务执行失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
