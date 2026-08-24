# -*- coding: utf-8 -*-
"""生成成绩分析测试数据（CSV + Excel），学生姓名取自 js/data.js 的花名册。"""
import csv
import os
import random
import re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, '..', 'test-data')
os.makedirs(OUT, exist_ok=True)

SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '道德与法治', '历史', '地理']

# 从 js/data.js 提取 48 名学生姓名（保证导入时能匹配上花名册）
src = open(os.path.join(BASE, '..', 'js', 'data.js'), encoding='utf-8').read()
block_start = src.index('const STUDENTS = [')
block_end = src.index('];', block_start)
names = re.findall(r"name:\s*'([^']+)'", src[block_start:block_end])


def score_for(name, subj_idx):
    rnd = random.Random(sum(ord(c) for c in name) * 31 + subj_idx * 17 + 7)
    base = rnd.randint(55, 90)
    return max(40, min(100, base + rnd.randint(-12, 12)))


rows = []
for i, name in enumerate(names):
    row = [name]
    for j in range(len(SUBJECTS)):
        # 陈雨欣的物理留空，测试“缺考”单元格
        if name == '陈雨欣' and SUBJECTS[j] == '物理':
            row.append('')
        else:
            row.append(score_for(name, j))
    rows.append(row)

header = ['姓名'] + SUBJECTS


def style_header(ws, ncols):
    fill = PatternFill('solid', fgColor='E6F2EC')
    for c in range(1, ncols + 1):
        cell = ws.cell(row=1, column=c)
        cell.font = Font(bold=True, color='3F7D66')
        cell.fill = fill
        cell.alignment = Alignment(horizontal='center', vertical='center')


def set_widths(ws, widths):
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w


# CSV（带 BOM，Excel 可直接打开）
csv_path = os.path.join(OUT, '成绩-测试数据.csv')
with open(csv_path, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(header)
    w.writerows(rows)

# Excel
xlsx_path = os.path.join(OUT, '成绩-测试数据.xlsx')
wb = Workbook()
ws = wb.active
ws.title = '成绩'
ws.append(header)
for r in rows:
    ws.append(r)
style_header(ws, len(header))
set_widths(ws, [12] + [9] * len(SUBJECTS))

notes = wb.create_sheet('填写说明')
for line in [
    '成绩测试数据说明：',
    '1. 第一列是学生姓名（与花名册一致），其余列为科目成绩。',
    '2. 在应用中进入「导入数据 → 成绩」选择本文件，将自动新建一场考试。',
    '3. 「陈雨欣-物理」留空，用于测试缺考单元格的处理。',
    '4. 也支持首列为「学籍号」的格式；不认识的列会被忽略。'
]:
    notes.append([line])
set_widths(notes, [72])
wb.save(xlsx_path)

print(f'generated {len(rows)} students x {len(SUBJECTS)} subjects')
print(' -', os.path.basename(csv_path), os.path.getsize(csv_path), 'bytes')
print(' -', os.path.basename(xlsx_path), os.path.getsize(xlsx_path), 'bytes')
