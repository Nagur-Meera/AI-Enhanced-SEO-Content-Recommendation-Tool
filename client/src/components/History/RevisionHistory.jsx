import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import revisionService from '../../services/revisionService';
import { useContent } from '../../context/ContentContext';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  History,
  Clock,
  RotateCcw,
  GitCompare,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText
} from 'lucide-react';
import Loading from '../common/Loading';
import './RevisionHistory.css';

const RevisionHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentContent, fetchContent } = useContent();

  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevisions, setSelectedRevisions] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchContent(id);
        const response = await revisionService.getRevisions(id);
        if (response.success) {
          setRevisions(response.data);
        }
      } catch (error) {
        console.error('Error loading revisions:', error);
        toast.error('Failed to load revision history');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchContent]);

  const handleSelectRevision = (revisionId) => {
    if (selectedRevisions.includes(revisionId)) {
      setSelectedRevisions(selectedRevisions.filter((r) => r !== revisionId));
    } else if (selectedRevisions.length < 2) {
      setSelectedRevisions([...selectedRevisions, revisionId]);
    } else {
      setSelectedRevisions([selectedRevisions[1], revisionId]);
    }
  };

  const handleCompare = async () => {
    if (selectedRevisions.length !== 2) {
      toast.error('Please select exactly 2 revisions to compare');
      return;
    }

    setComparing(true);
    try {
      const response = await revisionService.compareRevisions(
        selectedRevisions[0],
        selectedRevisions[1]
      );
      if (response.success) {
        setComparison(response.data);
      }
    } catch (error) {
      toast.error('Failed to compare revisions');
    } finally {
      setComparing(false);
    }
  };

  const handleRestore = async (revisionId) => {
    if (!window.confirm('Are you sure you want to restore this revision?')) {
      return;
    }

    try {
      await revisionService.restoreRevision(revisionId);
      toast.success('Revision restored successfully');
      navigate(`/content/${id}`);
    } catch (error) {
      toast.error('Failed to restore revision');
    }
  };

  const getScoreChange = (current, previous) => {
    if (!previous) return null;
    const change = current - previous;
    if (change > 0) return { type: 'increase', value: change };
    if (change < 0) return { type: 'decrease', value: Math.abs(change) };
    return { type: 'none', value: 0 };
  };

  if (loading) {
    return <Loading text="Loading revision history..." />;
  }

  return (
    <div className="history-page">
      {/* Header */}
      <div className="history-header">
        <div className="header-left">
          <button
            className="btn btn-outline back-btn"
            onClick={() => navigate(`/content/${id}`)}
          >
            <ArrowLeft size={18} />
            Back to Editor
          </button>
          <div className="header-info">
            <h1>Revision History</h1>
            <p className="content-title">{currentContent?.title}</p>
          </div>
        </div>
        {selectedRevisions.length === 2 && (
          <button
            className="btn btn-primary"
            onClick={handleCompare}
            disabled={comparing}
          >
            <GitCompare size={18} />
            {comparing ? 'Comparing...' : 'Compare Selected'}
          </button>
        )}
      </div>

      {revisions.length === 0 ? (
        <div className="empty-history">
          <History size={48} strokeWidth={1} />
          <h2>No revision history</h2>
          <p>Save your content to create the first revision</p>
          <Link to={`/content/${id}`} className="btn btn-primary">
            Back to Editor
          </Link>
        </div>
      ) : (
        <div className="history-content">
          {/* Comparison View */}
          {comparison && (
            <div className="comparison-panel">
              <div className="comparison-header">
                <h2>
                  <GitCompare size={20} />
                  Comparison: Version {comparison.revision1.version} vs Version{' '}
                  {comparison.revision2.version}
                </h2>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => setComparison(null)}
                >
                  Close
                </button>
              </div>

              <div className="comparison-content">
                <div className="revision-preview">
                  <h3>Version {comparison.revision1.version}</h3>
                  <div className="preview-meta">
                    <span className="seo-score">SEO Score: <strong>{comparison.revision1.seoScore}</strong></span>
                  </div>
                  <div className="preview-title">
                    <strong>Title:</strong> {comparison.revision1.title}
                  </div>
                  <div className="preview-text">
                    {comparison.revision1.content}
                  </div>
                </div>
                <div className="revision-preview">
                  <h3>Version {comparison.revision2.version}</h3>
                  <div className="preview-meta">
                    <span className="seo-score">SEO Score: <strong>{comparison.revision2.seoScore}</strong></span>
                  </div>
                  <div className="preview-title">
                    <strong>Title:</strong> {comparison.revision2.title}
                  </div>
                  <div className="preview-text">
                    {comparison.revision2.content}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="revisions-timeline">
            <div className="timeline-header">
              <h2>
                <History size={20} />
                All Revisions ({revisions.length})
              </h2>
              <p className="selection-hint">
                Select 2 revisions to compare them
              </p>
            </div>

            <div className="timeline-list">
              {revisions.map((revision, index) => {
                const previousRevision = revisions[index + 1];
                const scoreChange = getScoreChange(
                  revision.seoScore,
                  previousRevision?.seoScore
                );

                return (
                  <div
                    key={revision._id}
                    className={`timeline-item ${
                      selectedRevisions.includes(revision._id) ? 'selected' : ''
                    }`}
                    onClick={() => handleSelectRevision(revision._id)}
                  >
                    <div className="timeline-marker">
                      <div className="marker-dot" />
                      {index < revisions.length - 1 && (
                        <div className="marker-line" />
                      )}
                    </div>

                    <div className="revision-card">
                      <div className="revision-header">
                        <div className="version-info">
                          <span className="version-badge">v{revision.version}</span>
                          {index === 0 && (
                            <span className="current-badge">Current</span>
                          )}
                        </div>
                        <div className="revision-actions">
                          {index !== 0 && (
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(revision._id);
                              }}
                            >
                              <RotateCcw size={14} />
                              Restore
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="revision-details">
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>
                            {new Date(revision.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="revision-stats">
                        <div className="seo-score">
                          <span className="score-label">SEO Score</span>
                          <span className="score-value">{revision.seoScore}</span>
                          {scoreChange && scoreChange.type !== 'none' && (
                            <span
                              className={`score-change ${scoreChange.type}`}
                            >
                              {scoreChange.type === 'increase' ? (
                                <TrendingUp size={14} />
                              ) : (
                                <TrendingDown size={14} />
                              )}
                              {scoreChange.value}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="revision-changes">{revision.changes}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionHistory;
