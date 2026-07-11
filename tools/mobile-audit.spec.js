const { test, expect } = require("@playwright/test");

const baseUrl = process.env.MOBILE_AUDIT_BASE_URL || "http://127.0.0.1:3050";
const routes = [
  "/",
  "/products",
  "/rfqs",
  "/spec-matcher",
  "/submittals",
  "/login",
  "/register",
  "/markets/uae",
  "/global/international-compliance",
  "/pm/dashboard",
  "/supplier/dashboard",
  "/admin/dashboard",
];

const viewports = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-14", width: 390, height: 844 },
  { name: "narrow-android", width: 360, height: 740 },
];

function safeName(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/[^\w-]+/g, "-");
}

test.describe("mobile responsiveness audit", () => {
  for (const viewport of viewports) {
    for (const route of routes) {
      test(`${viewport.name} ${route}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 60000 });
        await page.screenshot({
          path: `output/playwright/mobile-${viewport.name}-${safeName(route)}.png`,
          fullPage: true,
        });

        const overflow = await page.evaluate(() => {
          const viewportWidth = document.documentElement.clientWidth;
          const pageOverflow = document.documentElement.scrollWidth - viewportWidth;
          if (pageOverflow <= 1) {
            return [];
          }

          const hasClippingAncestor = (element) => {
            let node = element.parentElement;
            while (node && node !== document.body) {
              const style = window.getComputedStyle(node);
              if (["hidden", "clip", "auto", "scroll"].includes(style.overflowX)) {
                return true;
              }
              node = node.parentElement;
            }
            return false;
          };

          return Array.from(document.body.querySelectorAll("*"))
            .map((element) => {
              const rect = element.getBoundingClientRect();
              const style = window.getComputedStyle(element);
              return {
                element,
                tag: element.tagName.toLowerCase(),
                id: element.id || "",
                className:
                  typeof element.className === "string"
                    ? element.className.slice(0, 220)
                    : "",
                text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 100),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                position: style.position,
                overflowX: style.overflowX,
              };
            })
            .filter((item) => item.width > 0)
            .filter((item) => item.right > viewportWidth + 1 || item.left < -1)
            .filter((item) => item.position !== "fixed")
            .filter((item) => !hasClippingAncestor(item.element))
            .map(({ element, ...item }) => item)
            .slice(0, 20);
        });

        expect(overflow, JSON.stringify(overflow, null, 2)).toEqual([]);
        await expect(page.locator("body")).toBeVisible();
      });
    }
  }
});
