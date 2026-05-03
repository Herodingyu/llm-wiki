const fs = require('fs');
const path = require('path');

// Read existing concepts
const conceptsDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\concepts';
const existingConcepts = new Set(
  fs.readdirSync(conceptsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''))
);

// Read new source notes titles
const sourcesDir = 'D:\\\\llm-wiki\\\\llm-wiki\\\\wiki\\\\sources';
const sourceFiles = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.md'));

const newTitles = [];
for (const file of sourceFiles) {
  const filePath = path.join(sourcesDir, file);
  const stats = fs.statSync(filePath);
  if (stats.mtime > new Date('2026-05-02')) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^title:\s*(.+)$/m);
    if (match) {
      newTitles.push(match[1].trim());
    }
  }
}

// Extract potential concepts from titles
const conceptPatterns = [
  /trustzone/i, /optee/i, /tee/i, /gicv3/i, /gic/i,
  /uefi/i, /scmi/i, /scp/i, /smmu/i, /secure.boot/i,
  /efuse/i, /wear.leveling/i, /power.gating/i, /dvfs/i,
  /npu/i, /tpu/i, /dojo/i, /ai.chip/i, /inference.engine/i,
  /compiler/i, /noc/i, /hsm/i, /pmu/i, /bus.architecture/i,
  /rob/i, /system.address.mapping/i, /fan.out/i, /fowlp/i,
  /focos/i, /info/i, /avs/i, /low.power/i,
  /interrupt.routing/i, /mailbox/i, /mutex/i,
  /crypto/i, /authentication/i, /public.key/i,
  /secure.storage/i, /secure.debug/i, /secure.upgrade/i,
  /cpufreq/i, /devfreq/i, /thermal/i, /watchdog/i,
  /pm.qos/i, /power.domain/i, /runtime.pm/i,
  /device.tree/i, /acpi/i, /mmu/i, /tlb/i,
  /zero.copy/i, /iommu/i, /uio/i,
  /risc.v/i, /arm/i, /cortex/i,
  /ddr5/i, /lpddr5/i, /lpddr5x/i, /cxl/i,
  /mcrdimm/i, /3d.dram/i, /hbm/i,
  /i3c/i, /i2c/i, /spi/i, /uart/i, /pwm/i,
  /gpio/i, /pinctrl/i, /dma/i, /qspi/i,
  /local.dimming/i, /mini.led/i, /micro.led/i,
  /qd.oled/i, /oled/i, /tcon/i,
  /dms/i, /oms/i, /smart.cockpit/i,
  /slam/i, /ar/i, /vr/i, /xr/i, /lcos/i,
  /waveguide/i, /carplay/i,
  /chiplet/i, /verification/i, /tapeout/i,
  /agile.hardware/i, /risc.v/i
];

const extractedConcepts = new Set();
for (const title of newTitles) {
  for (const pattern of conceptPatterns) {
    const match = title.match(pattern);
    if (match) {
      const concept = match[0].toLowerCase().replace(/[\s_-]+/g, '-');
      extractedConcepts.add(concept);
    }
  }
}

// Filter out existing concepts
const newConcepts = [];
for (const concept of extractedConcepts) {
  if (!existingConcepts.has(concept)) {
    newConcepts.push(concept);
  }
}

console.log('Existing concepts:', existingConcepts.size);
console.log('Extracted concepts:', extractedConcepts.size);
console.log('New concepts:', newConcepts.length);
console.log('\nNew concepts to create:');
for (const c of newConcepts.sort()) {
  console.log(`  - ${c}`);
}
