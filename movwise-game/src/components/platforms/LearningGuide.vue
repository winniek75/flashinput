<template>
  <div class="learning-guide">
    <!-- 学習ガイドヘッダー -->
    <div class="guide-header">
      <h2 class="guide-title">🎓 学習の進め方ガイド</h2>
      <p class="guide-subtitle">MovWISE Academyで効果的に英語を学ぶための完全ガイド</p>
    </div>

    <!-- 現在の学習状況 -->
    <div class="current-status">
      <div class="status-card">
        <div class="status-icon">{{ getCurrentStageIcon() }}</div>
        <div class="status-content">
          <h3>現在のステージ</h3>
          <p class="stage-name">{{ currentStage.name }}</p>
          <p class="stage-description">{{ currentStage.description }}</p>
        </div>
        <div class="status-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{width: currentStage.progress + '%'}"></div>
          </div>
          <span class="progress-text">{{ currentStage.progress }}%完了</span>
        </div>
      </div>

      <!-- 次にやるべきこと -->
      <div class="next-action">
        <h3>🎯 次にやるべきこと</h3>
        <div class="action-card" @click="goToNextAction">
          <div class="action-icon">{{ nextAction.icon }}</div>
          <div class="action-content">
            <h4>{{ nextAction.title }}</h4>
            <p>{{ nextAction.description }}</p>
            <div class="action-meta">
              <span class="time">⏱️ {{ nextAction.estimatedTime }}分</span>
              <span class="difficulty">{{ nextAction.difficulty }}</span>
            </div>
          </div>
          <button class="action-button">
            始める →
          </button>
        </div>
      </div>
    </div>

    <!-- 学習フローチャート -->
    <div class="learning-flow">
      <h3>📊 学習フローチャート</h3>

      <div class="flow-container">
        <!-- Stage 1: 基礎固め -->
        <div class="flow-stage" :class="{ 'active': currentStageIndex === 0, 'completed': currentStageIndex > 0 }">
          <div class="stage-header">
            <div class="stage-number">1</div>
            <div class="stage-info">
              <h4>基礎固め期間（1-2週間）</h4>
              <p>フォニックスで英語の音を完全マスター</p>
            </div>
          </div>

          <div class="stage-tasks">
            <div class="task" v-for="task in stage1Tasks" :key="task.id">
              <Icon :name="task.completed ? 'check-circle' : 'circle'"
                    :class="task.completed ? 'text-green-500' : 'text-gray-400'" />
              <span>{{ task.name }}</span>
              <span class="task-time">{{ task.time }}分</span>
            </div>
          </div>

          <div class="stage-tip">
            💡 <strong>学習のコツ:</strong> 毎日15-20分、音の練習を継続しましょう
          </div>
        </div>

        <div class="flow-arrow">↓</div>

        <!-- Stage 2: スキル構築 -->
        <div class="flow-stage" :class="{ 'active': currentStageIndex === 1, 'completed': currentStageIndex > 1 }">
          <div class="stage-header">
            <div class="stage-number">2</div>
            <div class="stage-info">
              <h4>スキル構築期間（2-3週間）</h4>
              <p>文法と語彙を並行して学習</p>
            </div>
          </div>

          <div class="stage-tasks">
            <div class="task" v-for="task in stage2Tasks" :key="task.id">
              <Icon :name="task.completed ? 'check-circle' : 'circle'"
                    :class="task.completed ? 'text-green-500' : 'text-gray-400'" />
              <span>{{ task.name }}</span>
              <span class="task-time">{{ task.time }}分</span>
            </div>
          </div>

          <div class="stage-tip">
            💡 <strong>学習のコツ:</strong> 文法と語彙を交互に学習して飽きを防ぐ
          </div>
        </div>

        <div class="flow-arrow">↓</div>

        <!-- Stage 3: 実践応用 -->
        <div class="flow-stage" :class="{ 'active': currentStageIndex === 2, 'completed': currentStageIndex > 2 }">
          <div class="stage-header">
            <div class="stage-number">3</div>
            <div class="stage-info">
              <h4>実践応用期間（2-3週間）</h4>
              <p>タイピングと実践的なスキルを磨く</p>
            </div>
          </div>

          <div class="stage-tasks">
            <div class="task" v-for="task in stage3Tasks" :key="task.id">
              <Icon :name="task.completed ? 'check-circle' : 'circle'"
                    :class="task.completed ? 'text-green-500' : 'text-gray-400'" />
              <span>{{ task.name }}</span>
              <span class="task-time">{{ task.time }}分</span>
            </div>
          </div>

          <div class="stage-tip">
            💡 <strong>学習のコツ:</strong> スピードより正確性を重視してタイピング練習
          </div>
        </div>

        <div class="flow-arrow">↓</div>

        <!-- Stage 4: 総合チャレンジ -->
        <div class="flow-stage" :class="{ 'active': currentStageIndex === 3, 'completed': currentStageIndex > 3 }">
          <div class="stage-header">
            <div class="stage-number">4</div>
            <div class="stage-info">
              <h4>総合マスター期間（1-2週間）</h4>
              <p>全スキルを統合した最終チャレンジ</p>
            </div>
          </div>

          <div class="stage-tasks">
            <div class="task" v-for="task in stage4Tasks" :key="task.id">
              <Icon :name="task.completed ? 'check-circle' : 'circle'"
                    :class="task.completed ? 'text-green-500' : 'text-gray-400'" />
              <span>{{ task.name }}</span>
              <span class="task-time">{{ task.time }}分</span>
            </div>
          </div>

          <div class="stage-tip">
            💡 <strong>学習のコツ:</strong> これまでの学習を振り返りながらチャレンジ
          </div>
        </div>
      </div>
    </div>

    <!-- デイリー学習プラン -->
    <div class="daily-plan">
      <h3>📅 推奨デイリープラン</h3>

      <div class="plan-cards">
        <!-- 初心者向け -->
        <div class="plan-card beginner">
          <div class="plan-header">
            <h4>🌱 初心者プラン</h4>
            <span class="plan-time">15-20分/日</span>
          </div>
          <div class="plan-schedule">
            <div class="schedule-item">
              <span class="time">5分</span>
              <span>ウォームアップ（前回の復習）</span>
            </div>
            <div class="schedule-item">
              <span class="time">10分</span>
              <span>メインゲーム1つ</span>
            </div>
            <div class="schedule-item">
              <span class="time">5分</span>
              <span>クールダウン（今日の振り返り）</span>
            </div>
          </div>
          <div class="plan-target">
            目標: 週5日以上の継続
          </div>
        </div>

        <!-- 標準プラン -->
        <div class="plan-card standard">
          <div class="plan-header">
            <h4>⭐ 標準プラン</h4>
            <span class="plan-time">30-40分/日</span>
          </div>
          <div class="plan-schedule">
            <div class="schedule-item">
              <span class="time">5分</span>
              <span>ウォームアップ</span>
            </div>
            <div class="schedule-item">
              <span class="time">15分</span>
              <span>メインプラットフォーム</span>
            </div>
            <div class="schedule-item">
              <span class="time">10分</span>
              <span>サブゲーム練習</span>
            </div>
            <div class="schedule-item">
              <span class="time">5分</span>
              <span>復習・振り返り</span>
            </div>
          </div>
          <div class="plan-target">
            目標: 毎日継続で2ヶ月完走
          </div>
        </div>

        <!-- 集中プラン -->
        <div class="plan-card intensive">
          <div class="plan-header">
            <h4>🔥 集中プラン</h4>
            <span class="plan-time">60分/日</span>
          </div>
          <div class="plan-schedule">
            <div class="schedule-item">
              <span class="time">10分</span>
              <span>ウォームアップ</span>
            </div>
            <div class="schedule-item">
              <span class="time">20分</span>
              <span>メインプラットフォーム</span>
            </div>
            <div class="schedule-item">
              <span class="time">20分</span>
              <span>複数ゲームの並行学習</span>
            </div>
            <div class="schedule-item">
              <span class="time">10分</span>
              <span>チャレンジモード</span>
            </div>
          </div>
          <div class="plan-target">
            目標: 1ヶ月で全プラットフォーム制覇
          </div>
        </div>
      </div>
    </div>

    <!-- 学習のコツ -->
    <div class="learning-tips">
      <h3>💡 効果的な学習のコツ</h3>

      <div class="tips-grid">
        <div class="tip-card">
          <div class="tip-icon">🎯</div>
          <h4>小さな目標を設定</h4>
          <p>毎日1つのゲームをクリアする、週に3つ星を10個集めるなど、達成可能な目標から始めましょう</p>
        </div>

        <div class="tip-card">
          <div class="tip-icon">📈</div>
          <h4>段階的に難易度アップ</h4>
          <p>簡単なゲームで自信をつけてから、徐々に難しいゲームに挑戦しましょう</p>
        </div>

        <div class="tip-card">
          <div class="tip-icon">🔄</div>
          <h4>定期的な復習</h4>
          <p>新しいゲームに進む前に、クリアしたゲームを時々プレイして知識を定着させましょう</p>
        </div>

        <div class="tip-card">
          <div class="tip-icon">📊</div>
          <h4>進捗を記録</h4>
          <p>プラットフォームの進捗バーを見て、自分の成長を実感しましょう</p>
        </div>

        <div class="tip-card">
          <div class="tip-icon">🎮</div>
          <h4>楽しむことが大切</h4>
          <p>ゲームを楽しみながら、自然に英語が身につくのがMovWISEの特徴です</p>
        </div>

        <div class="tip-card">
          <div class="tip-icon">👥</div>
          <h4>友達と競争</h4>
          <p>スコアを比較したり、一緒にチャレンジすることでモチベーションアップ</p>
        </div>
      </div>
    </div>

    <!-- モチベーション維持 -->
    <div class="motivation-section">
      <h3>🚀 モチベーションを保つには</h3>

      <div class="motivation-cards">
        <div class="motivation-card">
          <h4>ストリークを維持</h4>
          <p>連続ログイン日数を伸ばして、習慣化を目指しましょう</p>
        </div>

        <div class="motivation-card">
          <h4>バッジコレクション</h4>
          <p>様々なアチーブメントを解除して、コレクションを完成させましょう</p>
        </div>

        <div class="motivation-card">
          <h4>レベルアップの喜び</h4>
          <p>新しいゲームが解放される瞬間を楽しみに頑張りましょう</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '@/components/shared/Icon.vue'

export default {
  name: 'LearningGuide',
  components: {
    Icon
  },
  setup() {
    const router = useRouter()

    // 現在の学習ステージ
    const currentStageIndex = ref(0)

    const currentStage = computed(() => {
      const stages = [
        {
          name: 'フォニックス・アドベンチャー',
          description: '英語の音と文字の関係を学んでいます',
          progress: 45,
          icon: '🎵'
        },
        {
          name: 'スキル構築フェーズ',
          description: '文法と語彙を並行して学習中',
          progress: 30,
          icon: '📚'
        },
        {
          name: '実践応用フェーズ',
          description: 'タイピングと実践スキルを磨いています',
          progress: 0,
          icon: '⌨️'
        },
        {
          name: '総合マスターフェーズ',
          description: '全スキルを統合した最終段階',
          progress: 0,
          icon: '🏆'
        }
      ]
      return stages[currentStageIndex.value]
    })

    // 次のアクション
    const nextAction = computed(() => {
      return {
        icon: '🎮',
        title: 'サウンドファーム - レベル3',
        description: '複雑な音素のブレンディングに挑戦しよう',
        estimatedTime: 15,
        difficulty: '普通',
        route: '/games/sound-farm'
      }
    })

    // Stage 1 タスク
    const stage1Tasks = ref([
      { id: 1, name: 'サウンドファーム入門', time: 10, completed: true },
      { id: 2, name: '基本音素マスター', time: 15, completed: true },
      { id: 3, name: '文字と音の対応', time: 12, completed: false },
      { id: 4, name: 'ブレンディング基礎', time: 15, completed: false },
      { id: 5, name: 'リズム学習', time: 20, completed: false }
    ])

    // Stage 2 タスク
    const stage2Tasks = ref([
      { id: 1, name: 'Be動詞の基礎', time: 15, completed: false },
      { id: 2, name: '基本語彙100', time: 20, completed: false },
      { id: 3, name: '文構造パズル', time: 15, completed: false },
      { id: 4, name: '日常会話フレーズ', time: 25, completed: false },
      { id: 5, name: '時制の理解', time: 20, completed: false }
    ])

    // Stage 3 タスク
    const stage3Tasks = ref([
      { id: 1, name: 'タイピング基礎', time: 10, completed: false },
      { id: 2, name: 'スピードタイピング', time: 15, completed: false },
      { id: 3, name: 'ディクテーション', time: 20, completed: false },
      { id: 4, name: '発音チェック', time: 15, completed: false },
      { id: 5, name: '実践会話', time: 25, completed: false }
    ])

    // Stage 4 タスク
    const stage4Tasks = ref([
      { id: 1, name: '総合テスト初級', time: 30, completed: false },
      { id: 2, name: '総合テスト中級', time: 35, completed: false },
      { id: 3, name: '総合テスト上級', time: 40, completed: false },
      { id: 4, name: 'ボスチャレンジ', time: 25, completed: false },
      { id: 5, name: 'マスター認定試験', time: 45, completed: false }
    ])

    // メソッド
    const getCurrentStageIcon = () => currentStage.value.icon

    const goToNextAction = () => {
      router.push(nextAction.value.route)
    }

    return {
      currentStageIndex,
      currentStage,
      nextAction,
      stage1Tasks,
      stage2Tasks,
      stage3Tasks,
      stage4Tasks,
      getCurrentStageIcon,
      goToNextAction
    }
  }
}
</script>

<style scoped>
.learning-guide {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.guide-header {
  text-align: center;
  margin-bottom: 3rem;
}

.guide-title {
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.guide-subtitle {
  color: #6b7280;
  font-size: 1.125rem;
}

/* 現在の状況 */
.current-status {
  margin-bottom: 3rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-radius: 1rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
  margin-bottom: 2rem;
}

.status-icon {
  font-size: 3rem;
}

.status-content {
  flex: 1;
}

.status-content h3 {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stage-name {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stage-description {
  color: #6b7280;
}

.status-progress {
  width: 200px;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 次のアクション */
.next-action {
  margin-bottom: 3rem;
}

.next-action h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1f2937;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.action-icon {
  font-size: 2.5rem;
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.action-content p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.action-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.action-meta .time {
  color: #3b82f6;
}

.action-meta .difficulty {
  color: #10b981;
}

.action-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.action-button:hover {
  transform: scale(1.05);
}

/* 学習フロー */
.learning-flow {
  margin-bottom: 3rem;
}

.learning-flow h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #1f2937;
}

.flow-container {
  max-width: 800px;
  margin: 0 auto;
}

.flow-stage {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.flow-stage.active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #3b82f615, #8b5cf615);
}

.flow-stage.completed {
  border-color: #10b981;
  background: #f0fdf4;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stage-number {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: bold;
}

.flow-stage.completed .stage-number {
  background: #10b981;
}

.stage-info h4 {
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stage-info p {
  color: #6b7280;
}

.stage-tasks {
  margin-bottom: 1rem;
}

.task {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.task-time {
  margin-left: auto;
  font-size: 0.875rem;
  color: #6b7280;
}

.stage-tip {
  padding: 1rem;
  background: #fef3c7;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #92400e;
}

.flow-arrow {
  text-align: center;
  font-size: 1.5rem;
  color: #9ca3af;
  margin: 1rem 0;
}

/* デイリープラン */
.daily-plan {
  margin-bottom: 3rem;
}

.daily-plan h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #1f2937;
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.plan-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
}

.plan-card.beginner {
  border-color: #10b981;
}

.plan-card.standard {
  border-color: #3b82f6;
}

.plan-card.intensive {
  border-color: #ef4444;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plan-header h4 {
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
}

.plan-time {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  background: #f3f4f6;
  border-radius: 1rem;
  color: #6b7280;
}

.plan-schedule {
  margin-bottom: 1rem;
}

.schedule-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

.schedule-item .time {
  font-weight: 600;
  color: #3b82f6;
  min-width: 3rem;
}

.plan-target {
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

/* 学習のコツ */
.learning-tips {
  margin-bottom: 3rem;
}

.learning-tips h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #1f2937;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s;
}

.tip-card:hover {
  transform: translateY(-2px);
}

.tip-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.tip-card h4 {
  font-size: 1rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.tip-card p {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

/* モチベーション */
.motivation-section {
  margin-bottom: 3rem;
}

.motivation-section h3 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #1f2937;
}

.motivation-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.motivation-card {
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef3c7, #fed7aa);
  border-radius: 1rem;
}

.motivation-card h4 {
  font-size: 1rem;
  font-weight: bold;
  color: #92400e;
  margin-bottom: 0.5rem;
}

.motivation-card p {
  font-size: 0.875rem;
  color: #78350f;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .learning-guide {
    padding: 1rem;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
  }

  .action-card {
    flex-direction: column;
    text-align: center;
  }

  .plan-cards {
    grid-template-columns: 1fr;
  }

  .tips-grid {
    grid-template-columns: 1fr;
  }
}
</style>