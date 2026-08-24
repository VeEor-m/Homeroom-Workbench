/* ============================================================
 * 班主任工作台 · 模拟数据（第一阶段）
 * 班级：初三（2）班，48 名学生，8 个小组（每组 6 人）
 * ============================================================ */

const CLASS_INFO = {
  name: '初三（2）班',
  grade: '初三',
  teacher: '张老师',
  semester: '2026—2027 学年第一学期',
  studentCount: 48,
  groupCount: 8
};

/* 学生花名册：group 1-8，seatNo 按“排×10+列”，如 11 表示第 1 排第 1 列 */
const STUDENTS = [
  { id: 's01', name: '张明轩', gender: '男', group: 1, row: 1, col: 1, role: '班长', parent: '张建国', phone: '138****1234' },
  { id: 's02', name: '王梓涵', gender: '女', group: 1, row: 1, col: 2, role: '', parent: '王海涛', phone: '139****5621' },
  { id: 's03', name: '李思远', gender: '男', group: 1, row: 2, col: 1, role: '数学课代表', parent: '李卫东', phone: '136****7788' },
  { id: 's04', name: '刘子涵', gender: '女', group: 1, row: 2, col: 2, role: '', parent: '刘建平', phone: '150****3344' },
  { id: 's05', name: '陈欣怡', gender: '女', group: 1, row: 3, col: 1, role: '', parent: '陈志强', phone: '158****9012' },
  { id: 's06', name: '杨天乐', gender: '男', group: 1, row: 3, col: 2, role: '', parent: '杨国华', phone: '137****6688' },

  { id: 's07', name: '赵晨阳', gender: '男', group: 2, row: 1, col: 3, role: '', parent: '赵军', phone: '135****2468' },
  { id: 's08', name: '黄雅雯', gender: '女', group: 2, row: 1, col: 4, role: '学习委员', parent: '黄伟', phone: '139****1357' },
  { id: 's09', name: '周博文', gender: '男', group: 2, row: 2, col: 3, role: '', parent: '周明', phone: '137****8642' },
  { id: 's10', name: '吴思彤', gender: '女', group: 2, row: 2, col: 4, role: '', parent: '吴海', phone: '158****9753' },
  { id: 's11', name: '徐浩然', gender: '男', group: 2, row: 3, col: 3, role: '语文课代表', parent: '徐磊', phone: '136****3198' },
  { id: 's12', name: '孙嘉怡', gender: '女', group: 2, row: 3, col: 4, role: '', parent: '孙涛', phone: '150****6420' },

  { id: 's13', name: '马俊杰', gender: '男', group: 3, row: 1, col: 5, role: '纪律委员', parent: '马洪', phone: '138****5566' },
  { id: 's14', name: '朱晓琳', gender: '女', group: 3, row: 1, col: 6, role: '', parent: '朱伟东', phone: '139****7781' },
  { id: 's15', name: '胡宇轩', gender: '男', group: 3, row: 2, col: 5, role: '', parent: '胡兵', phone: '137****4455' },
  { id: 's16', name: '郭欣悦', gender: '女', group: 3, row: 2, col: 6, role: '英语课代表', parent: '郭涛', phone: '158****2233' },
  { id: 's17', name: '何俊豪', gender: '男', group: 3, row: 3, col: 5, role: '', parent: '何平', phone: '136****9087' },
  { id: 's18', name: '林思琪', gender: '女', group: 3, row: 3, col: 6, role: '文艺委员', parent: '林浩', phone: '150****3321' },

  { id: 's19', name: '赵一鸣', gender: '男', group: 4, row: 1, col: 7, role: '', parent: '赵德江', phone: '135****8899' },
  { id: 's20', name: '郑雅琪', gender: '女', group: 4, row: 1, col: 8, role: '', parent: '郑国栋', phone: '139****1122' },
  { id: 's21', name: '梁文博', gender: '男', group: 4, row: 2, col: 7, role: '', parent: '梁军', phone: '137****6677' },
  { id: 's22', name: '谢婷婷', gender: '女', group: 4, row: 2, col: 8, role: '', parent: '谢中华', phone: '158****4455' },
  { id: 's23', name: '宋志远', gender: '男', group: 4, row: 3, col: 7, role: '', parent: '宋强', phone: '136****9988' },
  { id: 's24', name: '唐婉婷', gender: '女', group: 4, row: 3, col: 8, role: '', parent: '唐勇', phone: '150****6677' },

  { id: 's25', name: '许俊杰', gender: '男', group: 5, row: 4, col: 1, role: '', parent: '许国平', phone: '138****2211' },
  { id: 's26', name: '韩雪莹', gender: '女', group: 5, row: 4, col: 2, role: '卫生委员', parent: '韩斌', phone: '139****3344' },
  { id: 's27', name: '冯天佑', gender: '男', group: 5, row: 5, col: 1, role: '体育委员', parent: '冯建军', phone: '137****5566' },
  { id: 's28', name: '邓雨欣', gender: '女', group: 5, row: 5, col: 2, role: '', parent: '邓超', phone: '158****7788' },
  { id: 's29', name: '曹子轩', gender: '男', group: 5, row: 6, col: 1, role: '', parent: '曹云', phone: '136****9900' },
  { id: 's30', name: '彭诗涵', gender: '女', group: 5, row: 6, col: 2, role: '', parent: '彭伟', phone: '150****1122' },

  { id: 's31', name: '曾宇轩', gender: '男', group: 6, row: 4, col: 3, role: '', parent: '曾凡', phone: '138****4455' },
  { id: 's32', name: '肖梦洁', gender: '女', group: 6, row: 4, col: 4, role: '', parent: '肖军', phone: '139****9988' },
  { id: 's33', name: '田嘉豪', gender: '男', group: 6, row: 5, col: 3, role: '', parent: '田伟', phone: '137****2233' },
  { id: 's34', name: '董思雨', gender: '女', group: 6, row: 5, col: 4, role: '宣传委员', parent: '董磊', phone: '158****5566' },
  { id: 's35', name: '袁博文', gender: '男', group: 6, row: 6, col: 3, role: '', parent: '袁军', phone: '136****7788' },
  { id: 's36', name: '潘静怡', gender: '女', group: 6, row: 6, col: 4, role: '', parent: '潘安', phone: '150****9900' },

  { id: 's37', name: '刘浩然', gender: '男', group: 7, row: 4, col: 5, role: '', parent: '刘建国', phone: '138****6677' },
  { id: 's38', name: '陈雨欣', gender: '女', group: 7, row: 4, col: 6, role: '', parent: '陈军', phone: '139****5566' },
  { id: 's39', name: '余俊杰', gender: '男', group: 7, row: 5, col: 5, role: '', parent: '余强', phone: '137****8899' },
  { id: 's40', name: '杜雅婷', gender: '女', group: 7, row: 5, col: 6, role: '', parent: '杜海', phone: '158****0011' },
  { id: 's41', name: '叶梓涵', gender: '女', group: 7, row: 6, col: 5, role: '', parent: '叶伟', phone: '136****3344' },
  { id: 's42', name: '程天宇', gender: '男', group: 7, row: 6, col: 6, role: '', parent: '程亮', phone: '150****5566' },

  { id: 's43', name: '苏婉清', gender: '女', group: 8, row: 4, col: 7, role: '生活委员', parent: '苏伟', phone: '138****7788' },
  { id: 's44', name: '魏子墨', gender: '男', group: 8, row: 4, col: 8, role: '', parent: '魏东', phone: '139****9900' },
  { id: 's45', name: '吕一凡', gender: '男', group: 8, row: 5, col: 7, role: '', parent: '吕强', phone: '137****1122' },
  { id: 's46', name: '丁若彤', gender: '女', group: 8, row: 5, col: 8, role: '', parent: '丁伟', phone: '158****3344' },
  { id: 's47', name: '周雨桐', gender: '女', group: 8, row: 6, col: 7, role: '', parent: '周立', phone: '136****5566' },
  { id: 's48', name: '沈梦瑶', gender: '女', group: 8, row: 6, col: 8, role: '', parent: '沈军', phone: '150****7788' }
];

/* 学籍号：未显式填写时按名单顺序生成 */
STUDENTS.forEach((s, i) => {
  s.stuNo = s.stuNo || ('2026' + String(i + 1).padStart(4, '0'));
});

const studentById = Object.fromEntries(STUDENTS.map(s => [s.id, s]));
const studentByName = Object.fromEntries(STUDENTS.map(s => [s.name, s]));

/* 早读考勤（今日） */
const ATTENDANCE = {
  date: '2026-08-24',
  total: 48,
  present: 46,          // 含迟到
  lateCount: 2,
  leaveCount: 1,
  absentCount: 1,
  late: [
    { name: '王梓涵', time: '07:42' },
    { name: '刘浩然', time: '07:46' }
  ],
  leave: [
    { name: '陈雨欣', reason: '病假（家长已请假）' }
  ],
  absent: [
    { name: '赵一鸣', note: '未请假，待联系家长核实' }
  ]
};

/* 本周课堂纪律 */
const DISCIPLINE = {
  week: '2026-08-24 至 08-28',
  rating: '良好',
  praiseCount: 5,
  remindCount: 8,
  focusCount: 3,
  daily: [
    { day: '周一', score: '优' },
    { day: '周二', score: '良' },
    { day: '周三', score: '优' },
    { day: '周四', score: '良' },
    { day: '周五', score: '待更新' }
  ],
  praise: [
    { name: '张明轩', scene: '数学课', reason: '主动上台讲解解题思路，思路清晰' },
    { name: '黄雅雯', scene: '英语课', reason: '小组讨论组织有序，带动组员参与' },
    { name: '林思琪', scene: '语文课', reason: '课文朗读示范声情并茂，获全班掌声' },
    { name: '许俊杰', scene: '物理课', reason: '实验操作规范认真，率先完成任务' },
    { name: '苏婉清', scene: '自习课', reason: '自觉维护自习纪律，提醒同学保持安静' }
  ],
  focus: [
    { name: '胡宇轩', issue: '上课注意力不集中', note: '建议与家长沟通并适度调整座位' },
    { name: '袁博文', issue: '自习课讲话较多', note: '已单独谈话，约定观察一周' },
    { name: '周雨桐', issue: '课间情绪低落', note: '建议心理老师跟进疏导' }
  ]
};

/* 作业收缴 */
const HOMEWORK = {
  date: '2026-08-24',
  subjects: [
    { subject: '语文', rate: 93.8, missing: ['周博文', '马俊杰', '曾宇轩'] },
    { subject: '数学', rate: 91.7, missing: ['赵一鸣', '袁博文', '余俊杰', '魏子墨'] },
    { subject: '英语', rate: 93.8, missing: ['胡宇轩', '刘浩然', '田嘉豪'] },
    { subject: '物理', rate: 89.6, missing: ['马俊杰', '赵一鸣', '刘子涵', '董思雨', '周雨桐'] },
    { subject: '化学', rate: 87.5, missing: ['赵一鸣', '胡宇轩', '余俊杰', '魏子墨', '陈雨欣', '沈梦瑶'] },
    { subject: '生物', rate: 91.7, missing: ['曾宇轩', '田嘉豪', '刘浩然', '周雨桐'] },
    { subject: '道德与法治', rate: 95.8, missing: ['赵一鸣', '袁博文'] },
    { subject: '历史', rate: 91.7, missing: ['马俊杰', '赵一鸣', '周雨桐', '魏子墨'] },
    { subject: '地理', rate: 89.6, missing: ['赵一鸣', '余俊杰', '周雨桐', '沈梦瑶', '董思雨'] }
  ]
};

/* 课间巡查 */
const PATROL = {
  date: '2026-08-24',
  records: [
    { time: '08:00–08:05', area: '教室', result: '正常', note: '晨读秩序良好，无异常' },
    { time: '09:40–09:45', area: '楼道东侧', result: '正常', note: '课间巡查未发现异常' },
    { time: '10:05–10:20', area: '操场', result: '正常', note: '大课间跑操有序，无追逐打闹' },
    { time: '13:50–13:55', area: '教学楼一层', result: '发现异常', note: '有学生在楼道奔跑，已当场提醒' },
    { time: '16:20–16:25', area: '教室及走廊', result: '正常', note: '放学后清场检查完毕' }
  ],
  anomalies: [
    { time: '13:52', location: '教学楼一层西侧楼道', desc: '两名学生在课间追逐打闹', action: '现场制止并教育，已通报相关班主任' },
    { time: '15:30', location: '三楼饮水间', desc: '地面有水渍，存在滑倒隐患', action: '通知保洁及时清理，并放置提示牌' }
  ]
};

/* 主题班会 */
const MEETINGS = {
  plan: [
    { date: '09-01', topic: '开学第一课：新起点·新目标', type: '主题班会' },
    { date: '09-14', topic: '行为规范与课堂纪律', type: '主题班会' },
    { date: '09-28', topic: '网络安全与自我保护', type: '主题班会' },
    { date: '10-12', topic: '爱国主题教育', type: '主题班会' },
    { date: '10-26', topic: '期中考试动员', type: '学习动员' },
    { date: '11-09', topic: '学习方法分享会', type: '经验交流' },
    { date: '12-07', topic: '心理健康：拥抱青春', type: '心理班会' }
  ],
  held: [
    {
      date: '08-20',
      topic: '暑假安全教育（线上）',
      type: '主题班会',
      summary: '围绕防溺水、交通安全、居家安全开展线上班会，48 名学生全部参加。',
      photos: []
    },
    {
      date: '07-25',
      topic: '暑期读书打卡启动会',
      type: '班级活动',
      summary: '发布暑期阅读书单与打卡规则，全班组建 5 个读书小组。',
      photos: ['activity-1.svg', 'activity-2.svg']
    }
  ]
};

/* 家校沟通 */
const COMMUNICATION = {
  records: [
    { date: '08-22', student: '王梓涵', method: '电话', content: '反馈近期两次迟到情况，家长表示将调整作息、督促早起。', result: '已沟通' },
    { date: '08-18', student: '陈雨欣', method: '微信', content: '确认病假及返校安排，叮嘱注意休息、按时服药。', result: '已沟通' },
    { date: '08-15', student: '李思远', method: '到校面谈', content: '交流暑期学习情况，约定开学后开展数学专题辅导。', result: '已面谈' },
    { date: '08-10', student: '周雨桐', method: '电话', content: '家长反映孩子暑期情绪紧张，建议开学后重点关注心理状态。', result: '已沟通' }
  ],
  visits: [
    { student: '赵一鸣', reason: '开学缺勤，需上门了解家庭情况', planDate: '08-29', status: '待安排' },
    { student: '周雨桐', reason: '学习压力大、情绪波动明显', planDate: '09-05', status: '待安排' },
    { student: '刘浩然', reason: '开学以来多次迟到，需家校联动', planDate: '09-12', status: '待安排' }
  ]
};

/* 学生成长 */
const GROWTH = {
  archiveRate: 92,
  archiveDone: 44,
  tutoringCount: 12,
  records: [
    { date: '08-22', student: '李思远', type: '学业辅导', content: '一元二次方程专题训练，正确率由 68% 提升至 82%。' },
    { date: '08-21', student: '周雨桐', type: '心理疏导', content: '考前焦虑疏导，约定每周一次谈心并记录情绪变化。' },
    { date: '08-19', student: '胡宇轩', type: '行为习惯', content: '制定课堂专注打卡计划，本周课堂提醒次数有所下降。' },
    { date: '08-16', student: '陈欣怡', type: '学业辅导', content: '英语完形填空专项，失分点集中在固定搭配，已布置针对性练习。' }
  ]
};

/* 班级活动 */
const ACTIVITIES = {
  upcoming: [
    { date: '09-30', name: '秋季运动会', note: '报名与训练计划待发布' },
    { date: '10-18', name: '班级文化墙评比', note: '设计主题征集进行中' },
    { date: '11-20', name: '读书分享会', note: '每小组推选 1 名代表分享' }
  ],
  held: [
    {
      date: '08-15',
      name: '暑期读书打卡总结会',
      summary: '5 个读书小组分享阅读成果，评选 3 名“阅读之星”，全班合影留念。',
      photos: ['activity-1.svg', 'activity-2.svg']
    },
    {
      date: '07-20',
      name: '社区志愿服务',
      summary: '12 名学生前往社区图书室整理图书、清洁环境，获社区表扬信。',
      photos: ['activity-2.svg', 'activity-3.svg']
    }
  ]
};

/* 课程表 */
const SCHEDULE = {
  days: ['周一', '周二', '周三', '周四', '周五'],
  periods: ['早读', '第1节', '第2节', '第3节', '第4节', '第5节', '第6节', '第7节', '第8节'],
  cells: {
    '周一-早读': { subject: '语文', teacher: '李老师' },
    '周一-第1节': { subject: '语文', teacher: '李老师' },
    '周一-第2节': { subject: '数学', teacher: '王老师' },
    '周一-第3节': { subject: '英语', teacher: '张老师' },
    '周一-第4节': { subject: '物理', teacher: '刘老师' },
    '周一-第5节': { subject: '数学', teacher: '王老师' },
    '周一-第6节': { subject: '化学', teacher: '陈老师' },
    '周一-第7节': { subject: '道德与法治', teacher: '赵老师' },
    '周一-第8节': { subject: '信息技术', teacher: '吴老师' },

    '周二-早读': { subject: '英语', teacher: '张老师' },
    '周二-第1节': { subject: '数学', teacher: '王老师' },
    '周二-第2节': { subject: '英语', teacher: '张老师' },
    '周二-第3节': { subject: '物理', teacher: '刘老师' },
    '周二-第4节': { subject: '化学', teacher: '陈老师' },
    '周二-第5节': { subject: '语文', teacher: '李老师' },
    '周二-第6节': { subject: '数学', teacher: '王老师' },
    '周二-第7节': { subject: '历史', teacher: '周老师' },
    '周二-第8节': { subject: '音乐', teacher: '郑老师' },

    '周三-早读': { subject: '语文', teacher: '李老师' },
    '周三-第1节': { subject: '英语', teacher: '张老师' },
    '周三-第2节': { subject: '数学', teacher: '王老师' },
    '周三-第3节': { subject: '语文', teacher: '李老师' },
    '周三-第4节': { subject: '体育', teacher: '孙老师' },
    '周三-第5节': { subject: '物理', teacher: '刘老师' },
    '周三-第6节': { subject: '英语', teacher: '张老师' },
    '周三-第7节': { subject: '道德与法治', teacher: '赵老师' },
    '周三-第8节': { subject: '美术', teacher: '冯老师' },

    '周四-早读': { subject: '英语', teacher: '张老师' },
    '周四-第1节': { subject: '物理', teacher: '刘老师' },
    '周四-第2节': { subject: '语文', teacher: '李老师' },
    '周四-第3节': { subject: '数学', teacher: '王老师' },
    '周四-第4节': { subject: '英语', teacher: '张老师' },
    '周四-第5节': { subject: '化学', teacher: '陈老师' },
    '周四-第6节': { subject: '体育', teacher: '孙老师' },
    '周四-第7节': { subject: '历史', teacher: '周老师' },
    '周四-第8节': { subject: '自习', teacher: '张老师' },

    '周五-早读': { subject: '语文', teacher: '李老师' },
    '周五-第1节': { subject: '数学', teacher: '王老师' },
    '周五-第2节': { subject: '英语', teacher: '张老师' },
    '周五-第3节': { subject: '化学', teacher: '陈老师' },
    '周五-第4节': { subject: '语文', teacher: '李老师' },
    '周五-第5节': { subject: '体育', teacher: '孙老师' },
    '周五-第6节': { subject: '物理', teacher: '刘老师' },
    '周五-第7节': { subject: '班会', teacher: '张老师' },
    '周五-第8节': { subject: '劳动', teacher: '张老师' }
  },
  teachers: {
    '语文': '李老师',
    '数学': '王老师',
    '英语': '张老师',
    '物理': '刘老师',
    '化学': '陈老师',
    '道德与法治': '赵老师',
    '历史': '周老师',
    '体育': '孙老师',
    '信息技术': '吴老师',
    '音乐': '郑老师',
    '美术': '冯老师',
    '班会': '张老师',
    '劳动': '张老师',
    '自习': '张老师'
  },
  adjustments: [
    { date: '09-04', from: '周三 第2节', to: '周三 第6节', subject: '数学', reason: '数学组教研活动', status: '已调' },
    { date: '09-11', from: '周四 第1节', to: '周五 第4节', subject: '物理', reason: '物理实验室设备检修', status: '已调' },
    { date: '09-18', from: '周一 第3节', to: '周二 第5节', subject: '英语', reason: '英语公开课（任课教师参加）', status: '待执行' }
  ]
};

/* 待办事项 */
const TODOS = [
  { id: 't1', text: '核实赵一鸣今日缺勤原因，并联系家长', due: '2026-08-24', priority: '高', done: false, createdAt: '2026-08-24' },
  { id: 't2', text: '确认秋季运动会报名与训练安排', due: '2026-08-28', priority: '中', done: false, createdAt: '2026-08-24' },
  { id: 't3', text: '确认本周家访计划（赵一鸣 8/29）', due: '2026-08-28', priority: '中', done: false, createdAt: '2026-08-24' }
];

/* 成绩分析：科目与示例考试成绩（确定性生成，便于复现） */
const GRADE_SUBJECTS = ['语文', '数学', '英语', '物理', '化学', '生物', '道德与法治', '历史', '地理'];

function gradeSeededRandom(seed) {
  let x = seed >>> 0;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

const GRADES = {
  exams: [
    { id: 'e1', name: '第一次月考', date: '2026-09-25' },
    { id: 'e2', name: '期中考试', date: '2026-11-05' }
  ].map((meta, ei) => {
    const scores = {};
    STUDENTS.forEach((s, i) => {
      const rnd = gradeSeededRandom(1000 + i * 97 + ei * 31);
      const ability = 52 + rnd() * 36;
      const drift = ei === 1 ? (rnd() * 10 - 5) : 0;
      const row = {};
      GRADE_SUBJECTS.forEach((subj, j) => {
        const bias = ((j * 37) % 11) - 5;
        const v = Math.max(38, Math.min(100, Math.round(ability + bias + drift + (rnd() * 20 - 10))));
        row[subj] = v;
      });
      scores[s.id] = row;
    });
    return { id: meta.id, name: meta.name, date: meta.date, scores };
  })
};

/* 值日表：按周排班，每周一~周五每天 6 人，任务循环分配 */
function buildDutyWeek(weekStart, students, tasks, offset) {
  const days = ['周一', '周二', '周三', '周四', '周五'];
  const perDay = 6;
  const assigned = {};
  days.forEach((day, di) => {
    const start = (offset * days.length * perDay + di * perDay) % students.length;
    const names = [];
    for (let k = 0; k < perDay; k += 1) {
      names.push(students[(start + k) % students.length].name);
    }
    assigned[day] = names;
  });
  return { weekStart, assigned, checks: {} };
}

const DUTY = {
  tasks: ['扫地', '擦黑板', '摆桌椅', '倒垃圾', '浇花'],
  weeks: [
    Object.assign({ id: 'w1' }, buildDutyWeek('2026-08-24', STUDENTS, ['扫地', '擦黑板', '摆桌椅', '倒垃圾', '浇花'], 0))
  ]
};

/* 班委名单：职务职责、考核记录、换届记录 */
const COMMITTEE = {
  roles: [
    { role: '班长', duty: '协助班主任管理班级日常事务，主持班会，做好上传下达' },
    { role: '副班长', duty: '协助班长工作，分管纪律与考勤' },
    { role: '学习委员', duty: '收集同学学习问题，组织学习小组与学习活动' },
    { role: '纪律委员', duty: '维护课堂与自习纪律，记录并反馈违纪情况' },
    { role: '卫生委员', duty: '组织值日与卫生检查，管理劳动工具' },
    { role: '体育委员', duty: '组织早操、课间操与体育活动，管理体育器材' },
    { role: '文艺委员', duty: '组织文娱活动与黑板报，丰富班级生活' },
    { role: '宣传委员', duty: '负责班级宣传、文化墙与活动记录' },
    { role: '生活委员', duty: '管理班费与生活事务，关心同学生活' },
    { role: '语文课代表', duty: '协助语文老师收发作业，反馈学习情况' },
    { role: '数学课代表', duty: '协助数学老师收发作业，反馈学习情况' },
    { role: '英语课代表', duty: '协助英语老师收发作业，反馈学习情况' }
  ],
  assessments: [
    { date: '2026-09-30', term: '9 月', name: '张明轩', role: '班长', score: 96, note: '组织班会与运动会报名，工作主动' },
    { date: '2026-09-30', term: '9 月', name: '黄雅雯', role: '学习委员', score: 92, note: '学习小组运转良好，及时反馈问题' },
    { date: '2026-09-30', term: '9 月', name: '马俊杰', role: '纪律委员', score: 90, note: '自习纪律有明显改善' }
  ],
  changes: [
    { date: '2026-09-01', role: '班长', old: '—', name: '张明轩', note: '开学任命' },
    { date: '2026-09-01', role: '学习委员', old: '—', name: '黄雅雯', note: '开学任命' }
  ]
};
