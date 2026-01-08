import { onMounted, onUnmounted } from 'vue'
import logger from '@/utils/logger'

/**
 * バックグラウンド音楽の管理用コンポーザブル
 * @param {string} musicId - 再生する音楽のID ('galaxy_runner' or 'matrix_crisis')
 * @param {number} volume - 音量 (0-100, デフォルト: 50)
 * @param {number} fadeOutDuration - フェードアウト時間 (ミリ秒, デフォルト: 500)
 */
export function useBackgroundMusic(musicId = 'matrix_crisis', volume = 50, fadeOutDuration = 500) {
  let soundManager = null

  onMounted(async () => {
    try {
      const module = await import('@/utils/soundManager')
      soundManager = module.soundManager
      await soundManager.playMusic(musicId, { 
        autoNext: false,
        volume 
      })
    } catch (error) {
      logger.log(`Background music '${musicId}' not available:`, error)
    }
  })

  onUnmounted(async () => {
    if (soundManager) {
      try {
        await soundManager.stopMusic(fadeOutDuration)
      } catch (error) {
        logger.log('Failed to stop music:', error)
      }
    }
  })

  // 手動でBGMを変更する関数を返す
  const changeMusic = async (newMusicId, newVolume = volume) => {
    if (soundManager) {
      try {
        await soundManager.stopMusic(200)
        await soundManager.playMusic(newMusicId, { 
          autoNext: false,
          volume: newVolume 
        })
      } catch (error) {
        logger.log(`Failed to change music to '${newMusicId}':`, error)
      }
    }
  }

  const stopMusic = async () => {
    if (soundManager) {
      try {
        await soundManager.stopMusic(fadeOutDuration)
      } catch (error) {
        logger.log('Failed to stop music:', error)
      }
    }
  }

  return {
    changeMusic,
    stopMusic
  }
}