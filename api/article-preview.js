import { supabase } from '../utils/supabase.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: '请提供文章ID' });
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: '文章不存在' });
    }

    // 直接返回格式化的内容
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send('<html><head><meta charset="UTF-8"><style>body{max-width:800px;margin:40px auto;padding:20px;font-family:sans-serif;line-height:1.8}</style></head><body>' + data.formatted_content + '</body></html>');

  } catch (error) {
    console.error('获取文章失败:', error);
    res.status(500).json({ error: error.message });
  }
}
