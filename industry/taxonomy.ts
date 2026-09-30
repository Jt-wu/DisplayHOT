// 显示行业分类、标签、机构与公司名录。网址 key 上线后保持稳定。
export const CATEGORIES = [
  { key: "market", label: "市场与价格", section: "市场与价格", guide: "出货量、面板与整机价格、供需、库存、稼动率、市场份额与周期变化" },
  { key: "technology", label: "面板与技术", section: "面板与技术", guide: "LCD、OLED、Mini LED、Micro LED、电子纸、量子点、背光、驱动IC、显示材料、设备与制造工艺进展" },
  { key: "industry", label: "产业链与投资", section: "产业链与投资", guide: "显示产业链产能建设、投资、并购、财报、合作、经营与政策监管" },
  { key: "applications", label: "终端与应用", section: "终端与应用", guide: "电视、显示器、笔记本、手机、车载、商显及AR/VR的显示产品与应用发布" },
  { key: "research", label: "研究与观点", section: "研究与观点", guide: "显示行业研究报告、论文、实测、方法、访谈、分析与技术解读；有明确价格或出货事实的报告优先归市场与价格" },
 ] as const;
export const ITEM_TYPES = ["technology_release", "product_launch", "market_report", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;
export const CATEGORY_TAGS = ["市场数据", "价格走势", "技术进展", "产品发布", "产能投资", "行业动态", "论文/研究", "评测/基准", "教程/实践", "现象/趋势", "行业观点", "政策/监管", "其他"] as const;
export const TOPIC_TAGS = ["LCD", "OLED", "AMOLED", "Mini LED", "Micro LED", "电子纸", "量子点", "背光", "驱动IC", "显示材料", "显示设备", "产能", "稼动率", "出货量", "面板价格", "电视", "显示器", "笔记本", "手机", "车载显示", "商用显示", "AR/VR"] as const;
export const ENTITY_TAGS = ["京东方", "TCL华星", "惠科", "友达光电", "群创光电", "三星显示", "LG显示", "天马", "维信诺", "TrendForce", "奥维云网", "奥维睿沃", "Omdia", "DSCC", "Counterpoint", "UBI Research"] as const;
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "市场": "市场数据", "出货": "出货量", "价格": "价格走势", "价格快讯": "价格走势", "技术": "技术进展",
  "产品": "产品发布", "产品更新": "产品发布", "并购": "行业动态", "融资": "产能投资", "投资": "产能投资",
  "论文": "论文/研究", "研究": "论文/研究", "观点": "行业观点", "趋势": "现象/趋势", "政策": "政策/监管",
  "MiniLED": "Mini LED", "mini-led": "Mini LED", "MicroLED": "Micro LED", "micro-led": "Micro LED",
};
export const CATEGORY_BY_ITEM_TYPE: Readonly<Record<string, string>> = {
  technology_release: "技术进展", product_launch: "产品发布", market_report: "市场数据", research_paper: "论文/研究",
  industry_event: "行业动态", opinion_analysis: "行业观点", tutorial_explainer: "教程/实践",
};
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[] }> = {
  "boe": { name: "京东方", displayTag: "京东方", aliases: ["BOE", "京东方"] },
  "tcl-csot": { name: "TCL华星", displayTag: "TCL华星", aliases: ["TCL CSOT", "CSOT", "TCL华星", "华星光电"] },
  "hkc": { name: "惠科", displayTag: "惠科", aliases: ["HKC", "惠科"] },
  "auo": { name: "友达光电", displayTag: "友达光电", aliases: ["AUO", "AU Optronics", "友达光电", "友达"] },
  "innolux": { name: "群创光电", displayTag: "群创光电", aliases: ["Innolux", "群创光电", "群创"] },
  "samsung-display": { name: "三星显示", displayTag: "三星显示", aliases: ["Samsung Display", "SDC", "三星显示"] },
  "lg-display": { name: "LG显示", displayTag: "LG显示", aliases: ["LG Display", "LGD", "LG显示", "乐金显示"] },
  "tianma": { name: "天马", displayTag: "天马", aliases: ["Tianma", "天马"] },
  "visionox": { name: "维信诺", displayTag: "维信诺", aliases: ["Visionox", "维信诺"] },
  "trendforce": { name: "TrendForce", displayTag: "TrendForce", aliases: ["TrendForce", "集邦咨询", "集邦", "WitsView"] },
  "avc": { name: "奥维云网", displayTag: "奥维云网", aliases: ["AVC", "奥维云网"] },
  "avc-revo": { name: "奥维睿沃", displayTag: "奥维睿沃", aliases: ["AVC REVO", "奥维睿沃"] },
  "omdia": { name: "Omdia", displayTag: "Omdia", aliases: ["Omdia"] },
  "dscc": { name: "DSCC", displayTag: "DSCC", aliases: ["DSCC", "Display Supply Chain Consultants"] },
  "counterpoint": { name: "Counterpoint", displayTag: "Counterpoint", aliases: ["Counterpoint", "Counterpoint Research"] },
  "ubiresearch": { name: "UBI Research", displayTag: "UBI Research", aliases: ["UBI Research", "UBIresearch"] },
};
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "boe", name: "京东方", patterns: [/\bBOE\b|京东方/i] },
  { id: "tcl-csot", name: "TCL华星", patterns: [/\bCSOT\b|TCL\s+CSOT|TCL华星|华星光电/i] },
  { id: "hkc", name: "惠科", patterns: [/\bHKC\b|惠科/i] },
  { id: "auo", name: "友达光电", patterns: [/\bAUO\b|AU\s+Optronics|友达/i] },
  { id: "innolux", name: "群创光电", patterns: [/Innolux|群创/i] },
  { id: "samsung-display", name: "三星显示", patterns: [/Samsung\s+Display|\bSDC\b|三星显示/i] },
  { id: "lg-display", name: "LG显示", patterns: [/LG\s+Display|\bLGD\b|LG显示|乐金显示/i] },
  { id: "tianma", name: "天马", patterns: [/Tianma|天马/i] },
  { id: "visionox", name: "维信诺", patterns: [/Visionox|维信诺/i] },
  { id: "trendforce", name: "TrendForce", patterns: [/TrendForce|集邦|WitsView/i] },
  { id: "avc", name: "奥维云网", patterns: [/奥维云网|\bAVC\b(?!\s+REVO)/i] },
  { id: "avc-revo", name: "奥维睿沃", patterns: [/奥维睿沃|AVC\s+REVO/i] },
  { id: "omdia", name: "Omdia", patterns: [/Omdia/i] },
  { id: "dscc", name: "DSCC", patterns: [/\bDSCC\b|Display Supply Chain Consultants/i] },
  { id: "counterpoint", name: "Counterpoint", patterns: [/Counterpoint/i] },
  { id: "ubiresearch", name: "UBI Research", patterns: [/UBI\s*Research/i] },
];
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "boe", domains: ["boe.com", "boe.com.cn"] },
  { entityId: "tcl-csot", domains: ["tclcsot.com"] },
  { entityId: "auo", domains: ["auo.com"] },
  { entityId: "innolux", domains: ["innolux.com"] },
  { entityId: "samsung-display", domains: ["samsungdisplay.com"] },
  { entityId: "lg-display", domains: ["lgdisplay.com"] },
  { entityId: "trendforce", domains: ["trendforce.com", "trendforce.cn", "trendforce.com.tw"] },
  { entityId: "avc", domains: ["avc-mr.com"] },
  { entityId: "omdia", domains: ["omdia.tech.informa.com"] },
  { entityId: "dscc", domains: ["display.counterpointresearch.com"] },
  { entityId: "counterpoint", domains: ["counterpointresearch.com"] },
  { entityId: "ubiresearch", domains: ["ubiresearch.com"] },
];
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
