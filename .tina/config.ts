import { defineConfig } from "tinacms";

const branch = "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "",
  },

  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "",
    },
  },

  schema: {
    collections: [
      // ═══════════ 旅行日记 ═══════════
      {
        name: "travel",
        label: "旅行日记",
        path: "content/travel",
        format: "md",
        ui: {
          filename: {
            readonly: false,
            slugify: (values) => {
              return `${values?.date?.slice(0,7) || "untitled"}-${values?.title?.toLowerCase().replace(/\s+/g, "-") || "untitled"}`;
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "标题",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "日期",
            ui: {
              dateFormat: "MMM YYYY",
            },
          },
          {
            type: "string",
            name: "country",
            label: "国家/地区",
          },
          {
            type: "image",
            name: "image",
            label: "封面图片",
          },
          {
            type: "string",
            name: "description",
            label: "简短描述",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "正文",
            isBody: true,
          },
        ],
      },

      // ═══════════ 博客文章 ═══════════
      {
        name: "posts",
        label: "博客文章",
        path: "content/posts",
        format: "mdx",
        fields: [
          {
            type: "string",
            name: "title",
            label: "标题",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "发布日期",
            ui: {
              dateFormat: "YYYY-MM-DD",
            },
          },
          {
            type: "image",
            name: "image",
            label: "封面图",
          },
          {
            type: "string",
            name: "tags",
            label: "标签",
            list: true,
          },
          {
            type: "string",
            name: "summary",
            label: "摘要",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "正文",
            isBody: true,
          },
        ],
      },

      // ═══════════ 网站设置 ═══════════
      {
        name: "settings",
        label: "网站设置",
        path: "content/settings",
        format: "json",
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        fields: [
          {
            type: "string",
            name: "siteName",
            label: "网站名称",
          },
          {
            type: "string",
            name: "siteDescription",
            label: "网站描述",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "object",
            name: "social",
            label: "社交媒体",
            fields: [
              { type: "string", name: "github", label: "GitHub" },
              { type: "string", name: "twitter", label: "Twitter" },
              { type: "string", name: "email", label: "邮箱" },
            ],
          },
        ],
      },
    ],
  },
});
