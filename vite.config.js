import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function collectiblesApiPlugin() {
  const baseDir = path.resolve(process.cwd(), 'collectibles');

  return {
    name: 'cervix3d-collectibles-api',
    configureServer(server) {
      server.middlewares.use('/api/collectibles', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (req.method === 'GET') {
          try {
            if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
            const dirs = fs.readdirSync(baseDir, { withFileTypes: true }).filter(d => d.isDirectory());
            const items = [];
            for (const d of dirs) {
              const folderPath = path.join(baseDir, d.name);
              const manifestPath = path.join(folderPath, 'manifest.json');
              const dossierPath = path.join(folderPath, 'dossier.md');
              if (fs.existsSync(manifestPath)) {
                const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
                const dossierMd = fs.existsSync(dossierPath) ? fs.readFileSync(dossierPath, 'utf8') : '';
                items.push({
                  folderName: d.name,
                  folderPath: `/collectibles/${d.name}`,
                  manifest,
                  dossierMd
                });
              }
            }
            res.end(JSON.stringify({ ok: true, items }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ ok: false, error: err.message }));
          }
          return;
        }

        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              const item = payload.collectible;
              if (!item || !item.id) {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: 'Missing collectible id' }));
                return;
              }
              const safeName = (item.folderName || `${item.id}_${item.name}`).replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_');
              const targetDir = path.join(baseDir, safeName);
              fs.mkdirSync(targetDir, { recursive: true });

              const manifestPath = path.join(targetDir, 'manifest.json');
              fs.writeFileSync(manifestPath, JSON.stringify(item, null, 2), 'utf8');

              const dossierMd = `# 颅相典藏档案 · ${item.name} (${item.id})

- **典藏编号**: \`${item.id}\`
- **藏品名称**: ${item.name}
- **副标题/骨相定位**: ${item.subtitle || '高精东亚女性头部典藏'}
- **典藏评级**: ${item.grade || 'SSR · 特级典藏'}
- **收录时间**: ${item.createdAt || new Date().toISOString()}
- **基底拓扑**: \`${item.basePreset}\`
- **发丝系统**: \`${item.hairStyle}\` (光泽度: ${item.hairSheen}, 断面避让度: ${item.neckClearance})
- **解剖断面水平**: ${item.anatomyOptions?.cutLevel || 'C4 标准横断面'}

## 一、骨相与照片对位纪要
${item.dossier?.origin || '采用 Daz 亚洲女性高精头部基底，结合半自动照片采样对位生成。'}

## 二、颈部医学解剖断面记录
${item.dossier?.anatomyNotes || '标准颈部横切面，含真皮切缘、皮下浅筋膜脂肪层、双侧胸锁乳突肌、气管透明软骨环、食管、双侧颈动脉鞘与颈椎椎体脊髓灰质。'}

## 三、写实发丝与外观工艺
${item.dossier?.hairNotes || '多层级各向异性丝感发片配微米级游离飞发。'}

## 四、3D盒型透视空间默认锚点
- **X 轴坐标**: ${item.boxPosition?.x ?? 0} cm
- **Y 轴坐标**: ${item.boxPosition?.y ?? 0} cm
- **Z 轴景深**: ${item.boxPosition?.z ?? -160} mm (相对屏幕前玻璃面 Z=0)
`;
              const dossierPath = path.join(targetDir, 'dossier.md');
              fs.writeFileSync(dossierPath, dossierMd, 'utf8');

              res.end(JSON.stringify({
                ok: true,
                folderName: safeName,
                folderPath: `/collectibles/${safeName}`,
                files: ['manifest.json', 'dossier.md']
              }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  },
  plugins: [collectiblesApiPlugin()]
});
