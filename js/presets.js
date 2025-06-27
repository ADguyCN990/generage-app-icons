/**
 * @file presets.js
 * @description 默认背景方案配置。您可以在此文件中添加、修改或删除预设方案。
 *              这些方案将在应用首次加载时作为默认选项，并可被用户自定义的方案覆盖。
 *
 * 方案结构说明：
 * 每个方案都是一个 JavaScript 对象，包含以下属性：
 * - `name` (string): 方案的显示名称，将显示在下拉菜单中。
 * - `type` (string): 方案类型。目前支持 "gradient" (渐变)。未来可能扩展支持 "image" 等。
 *   - 如果 `type` 为 "gradient"，则包含以下属性：
 *     - `bgColor1` (string): 渐变起始颜色 (HEX 格式，如 "#RRGGBB")。
 *     - `bgColor2` (string): 渐变结束颜色 (HEX 格式，如 "#RRGGBB")。
 *     - `gradientDirection` (string): 渐变方向。可选值包括：
 *       - "to top right" (左下到右上)
 *       - "to bottom right" (左上到右下)
 *       - "to right" (左到右)
 *       - "to left" (右到左)
 *       - "to top" (下到上)
 *       - "to bottom" (上到下)
 *     - `gradientSmoothness` (number): 渐变平滑度，范围 0-100。0 表示最锐利，100 表示最平滑。
 *   - 如果 `type` 为 "image"，则包含以下属性：
 *     - `imageUrl` (string): 背景图片的 URL。请确保图片已部署且可访问。
 */

const DEFAULT_PRESETS = [
    {
        name: "默认蓝紫渐变",
        type: "gradient",
        bgColor1: "#3a61ff",
        bgColor2: "#8438ff",
        gradientDirection: "to right",
        gradientSmoothness: 50
    },
    {
        name: "活力橙红",
        type: "gradient",
        bgColor1: "#FF5F6D",
        bgColor2: "#FFC371",
        gradientDirection: "to bottom right",
        gradientSmoothness: 70
    },
    {
        name: "深海之蓝",
        type: "gradient",
        bgColor1: "#000428",
        bgColor2: "#004e92",
        gradientDirection: "to top",
        gradientSmoothness: 30
    },
    // 示例图片背景 (请替换为实际图片URL)
    // {
    //     name: "科技感背景",
    //     type: "image",
    //     imageUrl: "./assets/tech_background.png" // 假设图片在项目根目录下的 assets 文件夹中
    // },
    // {
    //     name: "抽象纹理",
    //     type: "image",
    //     imageUrl: "https://example.com/images/abstract_texture.jpg"
    // }
];