import sys
import json
import fitz  # PyMuPDF
import os

def parse_pdf(file_path):
    try:
        doc = fitz.open(file_path)
        full_text = []
        metadata = doc.metadata
        
        # 1. 尝试提取文字层
        for page in doc:
            text = page.get_text().strip()
            if text:
                full_text.append(text)
        
        # 2. 如果文字太少，判定为扫描件，触发 OCR
        # 注意：EasyOCR 第一次运行会下载模型（约 100MB），之后就很快
        if len("".join(full_text)) < 50:
            try:
                import easyocr
                import numpy as np
                from PIL import Image
                
                reader = easyocr.Reader(['ch_sim', 'en']) # 支持中英文
                full_text = [] # 清空之前的少量杂质文字
                
                for page in doc:
                    # 将 PDF 页面渲染为图片
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2倍分辨率
                    img_data = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    
                    # 识别文字
                    results = reader.readtext(np.array(img_data))
                    page_text = " ".join([res[1] for res in results])
                    full_text.append(page_text)
            except ImportError:
                return {"error": "检测到扫描件，但本地未安装 OCR 库 (easyocr)"}
        
        return {
            "success": True,
            "text": "\n".join(full_text),
            "title": metadata.get("title") or os.path.basename(file_path),
            "pages": doc.page_count
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if 'doc' in locals():
            doc.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
    else:
        result = parse_pdf(sys.argv[1])
        print(json.dumps(result))
