export function generateImagePrompt(knowledgePoint: {
  title: string;
  content: string;
}): string {
  const baseStyle = '3D Isometric Illustration, minimalist white background, soft gradients, clean geometric shapes, educational diagram style';
  
  const topicKeywords: Record<string, string> = {
    '关系': 'connected nodes showing ordered pairs, arrows between set elements, bipartite graph visualization',
    '自反': 'self-loops on each node, circular arrows pointing back to the same element',
    '对称': 'bidirectional arrows between nodes, mirror-like connections',
    '传递': 'chain of connected elements, triangular path showing transitivity',
    '等价': 'partitioned sets with colored groups, equivalence classes as bubbles',
    '商集': 'collection of grouped elements, quotient structure visualization',
    '哈斯图': 'hierarchical diagram with nodes at different levels, partial order structure',
    '偏序': 'directed acyclic graph, layered structure showing order relations'
  };
  
  let topicMatch = '';
  for (const [keyword, description] of Object.entries(topicKeywords)) {
    if (knowledgePoint.title.includes(keyword) || knowledgePoint.content.includes(keyword)) {
      topicMatch = description;
      break;
    }
  }
  
  if (!topicMatch) {
    topicMatch = 'abstract mathematical concept visualization, interconnected geometric shapes';
  }
  
  const colorScheme = 'soft purple #8B5CF6 and cyan #00C3E3 accent colors, pastel tones';
  
  return `${baseStyle}, ${topicMatch}, ${colorScheme}, high quality render, educational material style, clean and modern design`;
}

export function generatePDFParsePrompt(filename: string): string {
  return `Analyzing PDF document: "${filename}"
  
Extracting knowledge structure:
1. Identify main chapters and sections
2. Extract key concepts and definitions
3. Find mathematical formulas and theorems
4. Create learning progression path

Generating gamified learning experience...`;
}

export function generateAIExplanation(topic: string): string {
  const explanations: Record<string, string> = {
    '关系': '关系是描述集合元素之间联系的基本概念。在数学中，我们用序偶的集合来表示关系。',
    '等价类': '等价类是等价关系下相互关联的所有元素组成的集合。同一个等价类中的元素都等价，不同等价类的元素不等价。',
    '商集': '商集是由所有等价类组成的集合，它代表了原集合的一种"压缩"视角。'
  };
  
  return explanations[topic] || `关于"${topic}"的解释：这是离散数学中的一个重要概念，建议结合具体例子来理解。`;
}
