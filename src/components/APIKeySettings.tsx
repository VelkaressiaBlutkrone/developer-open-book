import { useState } from 'react'
import { getAPIKey, setAPIKey, getModel, setModel, MODELS } from '../ai/claude'
import type { ModelId } from '../ai/claude'

export function APIKeySettings() {
  const [apiKey, setApiKeyState] = useState(() => getAPIKey())
  const [selectedModel, setSelectedModel] = useState<ModelId>(() => getModel())
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setAPIKey(apiKey)
    setModel(selectedModel)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete() {
    setApiKeyState('')
    setAPIKey('')
  }

  return (
    <div className="api-settings">
      <div className="api-settings-field">
        <label className="api-settings-label">Claude API 키</label>
        <div className="api-settings-row">
          <input
            type="password"
            className="api-settings-input"
            value={apiKey}
            onChange={e => setApiKeyState(e.target.value)}
            placeholder="sk-ant-..."
          />
          <button
            className="api-settings-delete"
            onClick={handleDelete}
            title="키 삭제"
            aria-label="API 키 삭제"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="api-settings-field">
        <label className="api-settings-label">모델 선택</label>
        <div className="api-settings-models">
          {MODELS.map(model => (
            <label key={model.id} className="api-settings-model">
              <input
                type="radio"
                name="model"
                value={model.id}
                checked={selectedModel === model.id}
                onChange={() => setSelectedModel(model.id as ModelId)}
              />
              {model.name}
            </label>
          ))}
        </div>
      </div>

      <button className="api-settings-save" onClick={handleSave}>
        {saved ? '✅ 저장됨' : '저장'}
      </button>
    </div>
  )
}
