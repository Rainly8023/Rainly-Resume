# Kawaii 二次元个人站 · 设计规格

> 2026-06-20 | Rainly | 纯静态，部署到 GitHub Pages

## 设计概述

日系软萌 Kawaii 风格的二次元个人网站，用于展示美少女照片画廊和博客。
美学定位：像少女漫画扉页般的梦幻感——樱花、星星、拍立得、奶油色。

## 网站结构（4 页）

| 页面 | 路由 | 功能 |
|------|------|------|
| **首页 · 星空入口** | `/` | 全屏花雨背景，居中 Logo + 导航，像魔法入口 |
| **美少女画廊** | `/gallery` | Three.js 3D 拍立得旋转木马 |
| **博客** | `/blog` | 少女漫画杂志风文章列表 |
| **关于我** | `/about` | 收藏卡风格个人介绍卡片 |

## 配色方案

| 用途 | 色值 |
|------|------|
| 主色（樱花粉） | `#fce4ec` → `#f8bbd0` |
| 辅色（淡紫） | `#e8eaf6` → `#c5cae9` |
| 点缀（奶油黄） | `#fff9c4` → `#fff176` |
| 点缀（天空蓝） | `#e0f7fa` → `#b2ebf2` |
| 底色 | `#fafafa`（白/奶油底） |
| 文字色 | `#5d4037`（浅棕，柔和） |

## 各页详细设计

### 首页 (`/`)

- 全屏 Canvas 背景：飘落的樱花花瓣 + 闪烁小星星
- 中央大幅标题 "Rainly"（手写/圆体字体），带呼吸光晕
- 下方 4 个圆角入口按钮：画廊 / 博客 / 关于 / 旅行
- 每个按钮悬浮时放大 + 彩色阴影绽放
- 鼠标移动时跟随粒子尾迹
- 滚动或点击进入子页面，带翻页过渡

### 画廊 (`/gallery`)

- Three.js 场景：6-12 张拍立得卡片排列在 3D 环形上
- 每张卡片：白色边框 + 底部留白区域 + 手写体标题
- 交互方式：
  - 鼠标左右拖拽旋转整个环形
  - 滚轮控制旋转速度/缩放
  - 点击一张卡片 → 它飞出环形，旋转到屏幕中央放大
  - 再次点击或按 Esc → 卡片回到环形
  - 移动端：手指滑动旋转，点击放大
- 选中卡片的放大态：大图 + 描述文字 + 标签
- 画廊数据来自 `content/gallery.json`（CMS 可编辑）

### 博客列表 (`/blog`)

- 少女漫画杂志风排版：
  - 顶部大横幅：最新文章的封面图 + 大标题 + 日期
  - 下方文章列表：两列布局，每篇文章卡片
- 卡片设计：
  - 圆角，封面图在上方
  - 标题用衬线/圆体大字
  - 摘要 + 日期在下方
  - 花边装饰分隔线（CSS border-image / SVG）
  - 悬浮时卡片轻微上浮 + 粉色阴影
- 装饰元素：章节编号、丝带分隔、角落小花纹
- 文章数据来自 `content/posts/*.md`（CMS 可编辑）

### 博客详情 (`/blog/[slug]`)

- 文章全宽排版，最大宽度 700px 居中
- 顶部封面图（可选）
- 标题大字 + 日期
- 正文 Markdown 渲染
- 底部：返回按钮 + 上一篇/下一篇导航
- 阅读进度条（顶部细线，樱花粉色）

### 关于我 (`/about`)

- 一张超精致的"收藏卡"风格卡片
- 中央：圆形头像（带粉色发光边框）
- 下方：昵称 + 简介 + 标签
- 圆角按钮链接：GitHub / Twitter / Email
- 卡片背景半透明磨砂玻璃（glassmorphism）
- 周围飘落花瓣

## 动效系统

| 动效 | 技术 | 触发方式 |
|------|------|----------|
| 花瓣飘落 | Canvas 2D | 全局持续 |
| 星星闪烁 | Canvas 2D | 全局持续 |
| 鼠标粒子尾迹 | Canvas 2D | 鼠标移动 |
| 3D 环形旋转 | Three.js | 拖拽/滚轮 |
| 卡片弹性放大 | CSS transition | 悬浮 |
| 点击爱心爆散 | Canvas 2D | 点击任意空白处 |
| 页面切换过渡 | CSS/JS | 路由切换 |
| 滚动淡入 | Intersection Observer | 元素进入视口 |
| 阅读进度条 | scroll 事件 | 滚动 |

## 技术栈

| 层 | 选择 |
|----|------|
| HTML/CSS | 纯原生，无框架 |
| 3D 引擎 | Three.js（CDN 引入） |
| 动画 | GSAP（CDN 引入） |
| 内容管理 | Decap CMS（`/admin`） |
| Markdown 渲染 | marked.js（CDN 引入） |
| 路由 | 基于 hash 的简单 SPA 路由 |
| 构建 | 无构建步骤，纯静态文件 |
| 部署 | GitHub Pages（main `/`） |

## 内容数据模型

### gallery.json
```json
[
  {
    "id": "1",
    "title": "桜と共に",
    "image": "images/gallery/sakura.jpg",
    "description": "...",
    "tags": ["桜", "春"]
  }
]
```

### Blog Markdown（content/posts/）
```md
---
title: "文章标题"
date: "2026-06-20"
image: "images/posts/cover.jpg"
tags: ["标签1"]
summary: "摘要"
---

正文内容...
```

## 文件结构

```
/
├── index.html              # 首页
├── gallery.html            # 画廊页
├── blog.html               # 博客列表 + 详情（SPA 路由）
├── about.html              # 关于页
├── css/
│   └── kawaii.css          # 全局样式
├── js/
│   ├── app.js              # 路由 + 页面切换
│   ├── sakura-petals.js    # 花瓣粒子系统
│   ├── mouse-trail.js      # 鼠标尾迹
│   ├── click-heart.js      # 点击爱心
│   ├── gallery-3d.js       # Three.js 3D 木马
│   ├── blog-render.js      # 博客渲染
│   └── scroll-reveal.js    # 滚动淡入
├── content/
│   ├── gallery.json        # 画廊数据
│   ├── posts/              # 博客 Markdown
│   └── settings/           # 网站设置
├── images/
│   ├── gallery/            # 画廊图片
│   └── posts/              # 博文配图
└── admin/                  # Decap CMS
```

## 性能考虑

- 所有库 CDN 加载（无 node_modules 部署负担）
- 画廊图片懒加载 + 缩略图
- Canvas 粒子控制数量上限（移动端减半）
- 3D 场景仅在画廊页激活，离开时释放
- 总页面大小目标：首次加载 < 500KB
