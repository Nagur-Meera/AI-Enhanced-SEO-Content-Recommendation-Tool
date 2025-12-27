import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContent } from '../../context/ContentContext';
import seoService from '../../services/seoService';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  TrendingUp,
  Loader,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import Loading from '../common/Loading';
import './SEOAnalysis.css';

const SEOAnalysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentContent,
    currentAnalysis,
    analyzing,
    fetchContent,
    fetchAnalysis,
    analyzeContent
  } = useContent();

  const [loading, setLoading] = useState(true);
  const [basicMetrics, setBasicMetrics] = useState(null);
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchContent(id);
        const analysisData = await fetchAnalysis(id);
        if (analysisData) {
          setBasicMetrics(analysisData.basicMetrics);
          setChecklist(analysisData.checklist);
        }
      } catch (error) {
        console.error('Error loading analysis:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchContent, fetchAnalysis]);

  const handleReanalyze = async () => {
    try {
      const result = await analyzeContent(id);
      setBasicMetrics(result.basicMetrics);
      toast.success('Content re-analyzed successfully');
    } catch (error) {
      toast.error('Failed to analyze content');
    }
  };

  const handleApplySuggestion = async (index) => {
    try {
      await seoService.applySuggestion(id, index, 'manual');
      toast.success('Suggestion marked as applied');
      await fetchAnalysis(id);
    } catch (error) {
      toast.error('Failed to apply suggestion');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  if (loading) {
    return <Loading text="Loading analysis..." />;
  }

  if (!currentContent) {
    return (
      <div className="analysis-page">
        <div className="empty-analysis">
          <h2>Content not found</h2>
          <Link to="/content" className="btn btn-primary">
            Back to Content
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      {/* Header */}
      <div className="analysis-header">
        <div className="header-left">
          <button
            className="btn btn-outline back-btn"
            onClick={() => navigate(`/content/${id}`)}
          >
            <ArrowLeft size={18} />
            Back to Editor
          </button>
          <div className="header-info">
            <h1>SEO Analysis</h1>
            <p className="content-title">{currentContent.title}</p>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleReanalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <Loader size={18} className="spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Re-analyze
            </>
          )}
        </button>
      </div>

      {!currentAnalysis ? (
        <div className="no-analysis">
          <Sparkles size={48} strokeWidth={1} />
          <h2>No analysis available</h2>
          <p>Run an AI-powered SEO analysis to get recommendations</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleReanalyze}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Now'}
          </button>
        </div>
      ) : (
        <div className="analysis-content">
          {/* Score Overview */}
          <div className="score-overview">
            <div className="main-score">
              <div
                className={`score-circle-xl score-${getScoreColor(
                  currentAnalysis.overallScore
                )}`}
              >
                {currentAnalysis.overallScore}
              </div>
              <div className="score-info">
                <span className="score-label-text">
                  {getScoreLabel(currentAnalysis.overallScore)}
                </span>
                <span className="score-description">Overall SEO Score</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="score-breakdown">
              {Object.entries(currentAnalysis.scores).map(([key, value]) => (
                <div key={key} className="score-item">
                  <div className="score-item-header">
                    <span className="score-item-label">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`score-item-value ${getScoreColor(value)}`}>
                      {value}
                    </span>
                  </div>
                  <div className="score-bar">
                    <div
                      className={`score-bar-fill ${getScoreColor(value)}`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-grid">
            {/* Improvements */}
            <div className="analysis-card improvements-card">
              <div className="card-header">
                <Lightbulb size={20} />
                <h2>Improvement Suggestions</h2>
              </div>
              <div className="improvements-list">
                {currentAnalysis.improvements.map((improvement, index) => (
                  <div
                    key={index}
                    className={`improvement-item ${
                      improvement.applied ? 'applied' : ''
                    }`}
                  >
                    <div className="improvement-header">
                      <span
                        className={`priority-badge priority-${improvement.priority}`}
                      >
                        {improvement.priority}
                      </span>
                      <span className="category-badge">{improvement.category}</span>
                    </div>
                    <p className="improvement-text">{improvement.suggestion}</p>
                    <div className="improvement-footer">
                      <span className="impact">
                        Impact: {improvement.impact}/10
                      </span>
                      {!improvement.applied ? (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleApplySuggestion(index)}
                        >
                          Mark as Applied
                        </button>
                      ) : (
                        <span className="applied-badge">
                          <CheckCircle2 size={14} />
                          Applied
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div className="analysis-card keywords-card">
              <div className="card-header">
                <Target size={20} />
                <h2>Suggested Keywords</h2>
              </div>
              <div className="keywords-list">
                {currentAnalysis.suggestedKeywords.map((kw, index) => (
                  <div key={index} className="keyword-item">
                    <div className="keyword-info">
                      <span className="keyword-text">{kw.keyword}</span>
                      <div className="keyword-meta">
                        <span className={`volume-badge volume-${kw.searchVolume}`}>
                          {kw.searchVolume} volume
                        </span>
                        <span
                          className={`difficulty-badge difficulty-${kw.difficulty}`}
                        >
                          {kw.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="relevance-score">
                      <div className="relevance-bar">
                        <div
                          className="relevance-fill"
                          style={{ width: `${kw.relevance}%` }}
                        />
                      </div>
                      <span>{kw.relevance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="analysis-card insights-card">
              <div className="card-header">
                <Sparkles size={20} />
                <h2>AI Insights</h2>
              </div>
              <p className="insights-text">{currentAnalysis.aiInsights}</p>

              {currentAnalysis.suggestedTitle && (
                <div className="suggestion-box">
                  <h4>Suggested Title</h4>
                  <p>{currentAnalysis.suggestedTitle}</p>
                </div>
              )}

              {currentAnalysis.suggestedMetaDescription && (
                <div className="suggestion-box">
                  <h4>Suggested Meta Description</h4>
                  <p>{currentAnalysis.suggestedMetaDescription}</p>
                </div>
              )}
            </div>

            {/* SEO Checklist */}
            <div className="analysis-card checklist-card">
              <div className="card-header">
                <CheckCircle2 size={20} />
                <h2>SEO Checklist</h2>
              </div>
              <div className="checklist-list">
                {checklist.map((item, index) => (
                  <div
                    key={index}
                    className={`checklist-item ${item.passed ? 'passed' : 'failed'}`}
                  >
                    <div className="checklist-icon">
                      {item.passed ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <AlertCircle size={18} />
                      )}
                    </div>
                    <div className="checklist-content">
                      <span className="checklist-label">{item.item}</span>
                      <span className="checklist-current">{item.current}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* View History Link */}
          <div className="analysis-footer">
            <Link to={`/content/${id}/history`} className="history-link">
              <span>View Revision History</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOAnalysis;
