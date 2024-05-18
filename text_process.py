import os
import re
import jieba
import jieba.analyse
from collections import Counter
import json

# 第1步和第2步：读取 .txt 文件并清洗数据
def clean_text(text):
    # 使用正则表达式去除公式和特殊符号等
    cleaned_text = re.sub(r'[0-9A-Za-z_]+', '', text)
    cleaned_text_1 = re.sub(r'[^\w\s]', '', cleaned_text)
    return cleaned_text_1

# 读取文件夹下所有.txt文件
folder_path = '48017'
files = [f for f in os.listdir(folder_path) if f.endswith('.txt')]

# 初始化分词结果的字典
#word_counts = Counter()
keywords_dict = {}

# 第3步：对每个文件进行分词
for file in files:
    with open(os.path.join(folder_path, file), 'r', encoding='utf-8') as f:
        print(f"Processing file {file}...")
        text = f.read()
        cleaned_text = clean_text(text)
        #words = jieba.lcut(cleaned_text)
        #word_counts.update(words)
        keyword_list = jieba.analyse.extract_tags(sentence=cleaned_text, topK=200, withWeight=False, allowPOS=())
        keywords_dict[file] = keyword_list
        # 将分词结果保存到json文件中
        #words_file = f"{file}_words.json"
    keywords_file = f"{folder_path}_keywords.json"
    res_folder = "keyword_extract_result"
    if not os.path.exists(res_folder):
        os.makedirs(res_folder)
    #word_save_path = os.path.join(res_folder, words_file)
    save_path = os.path.join(res_folder, keywords_file)
        
    #with open(word_save_path, 'w', encoding='utf-8') as wf:
        #json.dump(words, wf, ensure_ascii=False)
    with open(save_path, 'w', encoding='utf-8') as wf:
        json.dump(keywords_dict, wf, ensure_ascii=False, indent = 4)

# 第4步：统计词频并保存频率最高的词
#most_common_words = word_counts.most_common(100)  # 可以根据需要调整这个数值

# 第5步：将统计结果保存到.json文件中
#with open('most_common_words.json', 'w', encoding='utf-8') as f:
    #json.dump(most_common_words, f, ensure_ascii=False)
