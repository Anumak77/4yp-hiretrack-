import {pdfjsLib} from 'pdfjs-dist';


export const extractTextFromPdf = async (file) => {
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  const pageTexts = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item) => item.str).join(' ');
    pageTexts.push(text);
  }

  return pageTexts.join(' ');
};


//cosine similarity 
export const cosineSimilarity = (text1, text2) => {
    const tokenize = (text) => {
      return text.split(/\s+/).reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
    };
  
    const dotProduct = (vec1, vec2) => {
      return Object.keys(vec1).reduce((sum, key) => {
        return sum + (vec1[key] * (vec2[key] || 0));
      }, 0);
    };
  
    const magnitude = (vec) => {
      return Math.sqrt(Object.values(vec).reduce((sum, value) => sum + value * value, 0));
    };
  
    const vec1 = tokenize(text1);
    const vec2 = tokenize(text2);
  
    return dotProduct(vec1, vec2) / (magnitude(vec1) * magnitude(vec2));
  };
  
  