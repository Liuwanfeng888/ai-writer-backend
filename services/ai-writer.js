const DEEPSEEK_API_KEY = process.env.ANTHROPIC_API_KEY; // 复用这个环境变量
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const WRITING_STYLE_PROMPT = `你是一位资深情感观察类公众号作者，擅长从社会热点事件中挖掘深层人性。

【写作风格特征】
1. 叙事方式：
   - 以第三人称客观叙述
   - 开头直接进入核心事件，不铺垫
   - 通过具体细节和对话展开
   - 结尾用金句或追问收尾

2. 语言特点：
   - 短句为主，节奏快
   - 大量使用反问句制造思考
   - 情感克制但有力度
   - 避免鸡汤式励志和说教

3. 段落结构：
   - 每段1-3句话
   - 大量留白，呼吸感强
   - 关键句可用【】标注

4. 论证方式：
   - 从个案引申到普遍现象
   - 层层递进的逻辑
   - 用事实和细节说话

【文章结构要求】
- 开头：核心事件描述（100字左右）
- 中段：深层分析 + 人性洞察（800-1000字）
- 结尾：金句或追问（50字左右）
- 总字数：1200-1500字

【严格禁止】
- 过度煽情和鸡汤
- 长段落堆砌
- 陈词滥调
- 说教口吻`;

async function callDeepSeek(messages, systemPrompt) {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 4000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

export async function generateArticle(topic) {
  try {
    const userPrompt = `【今日热点话题】
${topic.title}

${topic.excerpt ? `【背景信息】\n${topic.excerpt}` : ''}

请基于以上热点话题，创作一篇深度观察类公众号文章。

要求：
1. 从第三人称角度分析这个事件
2. 挖掘事件背后的深层人性和社会现象
3. 表达独特观点，但不说教
4. 严格遵循上述写作风格

现在开始创作：`;

    const result = await callDeepSeek(
      [{ role: 'user', content: userPrompt }],
      WRITING_STYLE_PROMPT
    );

    const articleContent = result.choices[0].message.content;
    
    const lines = articleContent.trim().split('\n').filter(line => line.trim());
    const title = lines[0].replace(/^#\s*/, '').trim();
    const content = lines.slice(1).join('\n\n').trim();

    return {
      title,
      content,
      rawResponse: articleContent,
      usage: result.usage
    };
  } catch (error) {
    console.error('AI生成文章失败:', error.message);
    throw new Error(`生成失败: ${error.message}`);
  }
}

export async function selectTopics(topics, count = 2) {
  try {
    const topicsText = topics.map((t, i) => 
      `${i + 1}. ${t.title}${t.excerpt ? `\n   简介：${t.excerpt}` : ''}`
    ).join('\n\n');

    const result = await callDeepSeek(
      [{
        role: 'user',
        content: `你是一个公众号选题编辑，专注情感观察类内容。

以下是今日热点话题：

${topicsText}

请从中选出${count}个最适合写成深度情感观察文章的话题。

选题标准：
1. 有人性深度，能引发思考
2. 不是纯娱乐八卦
3. 不是过于政治敏感
4. 有故事性和讨论空间

请只返回选中话题的序号，用逗号分隔。例如：1,5`
      }],
      '你是一个专业的公众号选题编辑。'
    );

    const responseText = result.choices[0].message.content;
    const selectedIndexes = responseText
      .trim()
      .split(',')
      .map(n => parseInt(n.trim()) - 1)
      .filter(i => i >= 0 && i < topics.length);

    return selectedIndexes.map(i => topics[i]).slice(0, count);
  } catch (error) {
    console.error('AI选题失败:', error.message);
    return topics.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
