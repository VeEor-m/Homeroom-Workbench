# -*- coding: utf-8 -*-
"""生成 js/pinyin-data.js：应用数据汉字 + 常用姓氏的拼音映射表。"""
import os
import re

from pypinyin import lazy_pinyin

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, '..', 'js', 'pinyin-data.js')

COMMON_SURNAMES = (
    '王李张刘陈杨赵黄周吴徐孙马朱胡郭何高林罗郑梁谢宋唐许韩冯邓曹彭曾肖田董袁潘于蒋蔡余杜叶程苏魏吕丁任沈姚卢姜崔钟谭陆汪范金石廖贾夏韦傅方白邹孟熊秦邱江尹薛闫段雷侯龙史陶黎贺顾毛郝龚邵万钱严覃武戴莫孔向汤康赖文温樊兰殷'
)

src = open(os.path.join(BASE, '..', 'js', 'data.js'), encoding='utf-8').read()
chars = set(re.findall(r'[\u4e00-\u9fff]', src))
chars.update(COMMON_SURNAMES)

table = {}
for ch in sorted(chars):
    py = lazy_pinyin(ch)[0]
    if py and py != ch:
        table[ch] = py

lines = ['/* 拼音映射表（由 dev/gen_pinyin.py 生成，请勿手改） */', 'const PINYIN = {']
for ch in sorted(table):
    lines.append(f'  "{ch}": "{table[ch]}",')
lines.append('};')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print('pinyin chars:', len(table), '->', os.path.relpath(OUT, BASE))
print('sample:', {k: table[k] for k in list(table)[:5]})
