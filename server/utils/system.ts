import { exec } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

interface RamInfo {
  used_mb: number
  total_mb: number
}

interface GpuInfo {
  name: string
  vram_used_mb: number
  vram_total_mb: number
}

export async function getRamInfo(): Promise<RamInfo> {
  try {
    const meminfo = await readFile('/proc/meminfo', 'utf-8')
    const getValue = (key: string) => {
      const match = meminfo.match(new RegExp(`${key}:\\s+(\\d+)`))
      return match ? parseInt(match[1]!) : 0
    }
    const totalKb = getValue('MemTotal')
    const availableKb = getValue('MemAvailable')
    return {
      total_mb: Math.round(totalKb / 1024),
      used_mb: Math.round((totalKb - availableKb) / 1024),
    }
  } catch {
    return { used_mb: 0, total_mb: 0 }
  }
}

export async function getGpuInfo(): Promise<GpuInfo | null> {
  try {
    const { stdout: nameOut } = await execAsync('nvidia-smi --query-gpu=name --format=csv,noheader,nounits')
    const { stdout: memOut } = await execAsync('nvidia-smi --query-gpu=memory.used,memory.total --format=csv,noheader,nounits')
    const memParts = memOut.trim().split(',').map((s: string) => parseInt(s.trim()))
    return {
      name: nameOut.trim(),
      vram_used_mb: memParts[0] ?? 0,
      vram_total_mb: memParts[1] ?? 0,
    }
  } catch {
    return null
  }
}
