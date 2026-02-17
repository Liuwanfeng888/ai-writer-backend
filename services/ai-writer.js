const DEEPSEEK_API_KEY = process.env.ANTHROPIC_API_KEY; // 复用这个环境变量
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const WRITING_STYLE_PROMPT = `你是一位深受女性读者喜爱的情感类公众号作者，写作风格亲切接地气，善于用真实故事触动人心。

【文章结构】
必须严格按照以下结构：

1. 开头（100-150字）：
   - 用1-2句话点出社会现象或矛盾
   - 引出文章主题
   - 最后一句话做总结性过渡

2. 正文（分3个部分，每部分用"01/02/03"编号+小标题）：
   每个部分结构：
   - 小标题（4-8个字，点明这部分核心）
   - 一个真实的故事案例（150-200字）：有姓名、有细节、有对话、有转折
   - 基于故事的分析和观点（100-150字）
   - 一句有力的金句收尾

3. 结尾（100-150字）：
   - 总结升华
   - 给读者正向引导
   - 以温暖有力的句子结束

【写作要求】
- 语气：像闺蜜聊天，亲切不说教
- 段落：每段2-4句话，短句为主
- 案例：要有真实感，有人名（普通姓名如"何姐"、"安安"、"小林"）
- 对话：案例中要有直接引语，让故事生动
- 金句：每部分结尾要有一句让人想转发的话
- 视角：多站在普通人（尤其女性）的立场
- 禁止：长篇大论、学术腔、过度煽情、空洞说教

【总字数】1200-1500字

【特别注意】
- 标题不要出现在文章正文中
- 直接从第一段开始写
- 编号格式用：01、02、03（独立成行，加粗效果用【01】）
- 小标题单独成行，要简洁有力`;

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
   const userPrompt = `请基于以下热点话题，创作一篇情感观察类公众号文章：

【热点话题】${topic.title}
${topic.excerpt ? `【背景】${topic.excerpt}` : ''}

要求：
1. 从这个热点出发，挖掘背后的情感共鸣点
2. 结合现实生活中的具体场景和故事
3. 让读者看完有"说出了我心里话"的感觉
4. 严格按照三段式结构（01/02/03编号）
5. 每段必须有真实故事案例

现在开始创作（直接写正文，不要写标题）：`;

    const result = await callDeepSeek(
      [{ role: 'user', content: userPrompt }],
      WRITING_STYLE_PROMPT
    );

    const articleContent = result.choices[0].message.content;
    
    const lines = articleContent.trim().split('\n').filter(line => line.trim());
   const title = lines[0].replace(/^#+\s*/, '').replace(/^【.*?】\s*/, '').trim();

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
     content: `你是一个公众号选题编辑，专注情感类内容。

以下是今日热点话题：
${topicsText}

请从中选出${count}个话题，要求：
1. ${count}个话题必须是完全不同的方向（不能都是同一类型）
2. 优先选择有情感共鸣、与普通人生活相关的话题
3. 避免纯娱乐八卦和政治敏感话题
4. 每个话题要能写出不同角度的文章

请只返回选中话题的序号，用逗号分隔。例如：1,3`
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
