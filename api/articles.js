import { supabase } from '../utils/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      status = 'draft', 
      limit = 20, 
      offset = 0,
      date 
    } = req.query;

    let query = supabase
      .from('articles')
      .select('*')
      .order('generated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('generated_at', startOfDay.toISOString())
        .lte('generated_at', endOfDay.toISOString());
    }

    query = query.range(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit) - 1
    );

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data || [],
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('获取文章列表失败:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
