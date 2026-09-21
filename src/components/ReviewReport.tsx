import type { ReviewReport as Report, ReviewIssue } from '../types'

const SEVERITY_LABEL: Record<string, string> = {
  low: 'baixa',
  medium: 'média',
  high: 'alta',
  critical: 'crítica',
}

function scoreTone(score: number): string {
  if (score >= 80) return 'good'
  if (score >= 60) return 'warn'
  return 'bad'
}

function Issue({ issue, index }: { issue: ReviewIssue; index: number }) {
  const severity = (issue.severity ?? '').toLowerCase()

  return (
    <li className="issue">
      <div className="issue-head">
        <span className="issue-index">{index + 1}</span>
        <span className="issue-type">{issue.type ?? 'Observação'}</span>
        {severity && (
          <span className={`chip chip--${severity}`}>
            {SEVERITY_LABEL[severity] ?? severity}
          </span>
        )}
        {issue.line != null && (
          <span className="issue-line">linha {issue.line}</span>
        )}
      </div>

      {issue.description && <p className="issue-desc">{issue.description}</p>}

      {issue.suggestion && (
        <p className="issue-fix">
          <span className="issue-fix-label">Sugestão</span>
          {issue.suggestion}
        </p>
      )}
    </li>
  )
}

export default function ReviewReport({ report }: { report: Report }) {
  const issues = report.issues ?? []

  return (
    <div className="report">
      {(report.score != null || report.summary) && (
        <div className="report-head">
          {report.score != null && (
            <div className={`score score--${scoreTone(report.score)}`}>
              <strong>{report.score}</strong>
              <span>/100</span>
            </div>
          )}
          {report.summary && <p className="report-summary">{report.summary}</p>}
        </div>
      )}

      {issues.length > 0 ? (
        <ol className="issues">
          {issues.map((issue, i) => (
            <Issue key={i} issue={issue} index={i} />
          ))}
        </ol>
      ) : (
        <p className="report-clean">Nenhum problema apontado nesta análise.</p>
      )}
    </div>
  )
}
