import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Editor, EditorState, RichUtils, ContentState, convertToRaw, convertFromRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useContent } from '../../context/ContentContext';
import { toast } from 'react-toastify';
import {
  Save,
  Sparkles,
  BarChart3,
  History,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  ArrowLeft,
  X,
  Plus,
  Loader
} from 'lucide-react';
import './ContentEditor.css';

const ContentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentContent,
    loading,
    analyzing,
    fetchContent,
    createContent,
    updateContent,
    analyzeContent,
    clearCurrentContent
  } = useContent();

  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [title, setTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [targetKeywords, setTargetKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load content if editing
  useEffect(() => {
    if (id) {
      fetchContent(id);
    } else {
      clearCurrentContent();
      setEditorState(EditorState.createEmpty());
      setTitle('');
      setMetaDescription('');
      setTargetKeywords([]);
    }
  }, [id, fetchContent, clearCurrentContent]);

  // Populate form when content loads
  useEffect(() => {
    if (currentContent && id) {
      setTitle(currentContent.title || '');
      setMetaDescription(currentContent.metaDescription || '');
      setTargetKeywords(currentContent.targetKeywords || []);

      if (currentContent.content) {
        try {
          // Try to parse as Draft.js raw content
          const rawContent = JSON.parse(currentContent.contentHtml || '{}');
          if (rawContent.blocks) {
            setEditorState(
              EditorState.createWithContent(convertFromRaw(rawContent))
            );
          } else {
            // Plain text fallback
            setEditorState(
              EditorState.createWithContent(
                ContentState.createFromText(currentContent.content)
              )
            );
          }
        } catch (e) {
          // Plain text fallback
          setEditorState(
            EditorState.createWithContent(
              ContentState.createFromText(currentContent.content)
            )
          );
        }
      }
    }
  }, [currentContent, id]);

  const handleEditorChange = (state) => {
    setEditorState(state);
    setHasChanges(true);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      handleEditorChange(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style) => {
    handleEditorChange(RichUtils.toggleInlineStyle(editorState, style));
  };

  const toggleBlockType = (blockType) => {
    handleEditorChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !targetKeywords.includes(keywordInput.trim())) {
      setTargetKeywords([...targetKeywords, keywordInput.trim()]);
      setKeywordInput('');
      setHasChanges(true);
    }
  };

  const removeKeyword = (keyword) => {
    setTargetKeywords(targetKeywords.filter((k) => k !== keyword));
    setHasChanges(true);
  };

  const getPlainText = () => {
    return editorState.getCurrentContent().getPlainText();
  };

  const getWordCount = () => {
    const text = getPlainText();
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const handleSave = async (createRevision = false) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const plainText = getPlainText();
    if (!plainText.trim()) {
      toast.error('Please enter some content');
      return;
    }

    setSaving(true);

    const contentData = {
      title: title.trim(),
      content: plainText,
      contentHtml: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
      metaDescription: metaDescription.trim(),
      targetKeywords,
      createRevision
    };

    try {
      if (id) {
        await updateContent(id, contentData);
        toast.success('Content saved successfully');
      } else {
        const newContent = await createContent(contentData);
        toast.success('Draft created successfully');
        navigate(`/content/${newContent._id}`);
      }
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!id) {
      toast.error('Please save the content first');
      return;
    }

    try {
      await analyzeContent(id);
      toast.success('Content analyzed successfully');
      navigate(`/content/${id}/analysis`);
    } catch (error) {
      toast.error('Failed to analyze content');
    }
  };

  return (
    <div className="editor-page">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <button
            className="btn btn-outline back-btn"
            onClick={() => navigate('/content')}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <h1>{id ? 'Edit Content' : 'New Draft'}</h1>
        </div>
        <div className="header-actions">
          {id && (
            <>
              <Link
                to={`/content/${id}/history`}
                className="btn btn-outline"
              >
                <History size={18} />
                History
              </Link>
              <Link
                to={`/content/${id}/analysis`}
                className="btn btn-outline"
              >
                <BarChart3 size={18} />
                Analysis
              </Link>
              <button
                className="btn btn-success"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader size={18} className="spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze SEO
                  </>
                )}
              </button>
            </>
          )}
          <button
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader size={18} className="spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Main Editor */}
        <div className="editor-main">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setHasChanges(true);
            }}
            placeholder="Enter your title..."
            className="title-input"
          />

          {/* Toolbar */}
          <div className="editor-toolbar">
            <button
              className="toolbar-btn"
              onClick={() => toggleInlineStyle('BOLD')}
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => toggleInlineStyle('ITALIC')}
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => toggleInlineStyle('UNDERLINE')}
              title="Underline"
            >
              <Underline size={18} />
            </button>
            <div className="toolbar-divider" />
            <button
              className="toolbar-btn"
              onClick={() => toggleBlockType('header-one')}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => toggleBlockType('header-two')}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </button>
            <div className="toolbar-divider" />
            <button
              className="toolbar-btn"
              onClick={() => toggleBlockType('unordered-list-item')}
              title="Bullet List"
            >
              <List size={18} />
            </button>
            <button
              className="toolbar-btn"
              onClick={() => toggleBlockType('ordered-list-item')}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </button>
          </div>

          {/* Editor */}
          <div className="editor-container">
            <Editor
              editorState={editorState}
              onChange={handleEditorChange}
              handleKeyCommand={handleKeyCommand}
              placeholder="Start writing your content..."
            />
          </div>

          {/* Word Count */}
          <div className="editor-footer">
            <span>{getWordCount()} words</span>
            {hasChanges && <span className="unsaved-indicator">• Unsaved changes</span>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="editor-sidebar">
          {/* Meta Description */}
          <div className="sidebar-section">
            <h3>Meta Description</h3>
            <textarea
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Enter meta description (recommended: 150-160 characters)"
              className="meta-textarea"
              rows={3}
            />
            <div className="char-count">
              <span className={metaDescription.length > 160 ? 'over-limit' : ''}>
                {metaDescription.length}/160 characters
              </span>
            </div>
          </div>

          {/* Target Keywords */}
          <div className="sidebar-section">
            <h3>Target Keywords</h3>
            <div className="keyword-input-group">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add keyword..."
                className="keyword-input"
              />
              <button className="btn btn-sm btn-primary" onClick={addKeyword}>
                <Plus size={16} />
              </button>
            </div>
            <div className="keywords-list">
              {targetKeywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                  <button onClick={() => removeKeyword(keyword)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              {targetKeywords.length === 0 && (
                <p className="no-keywords">No keywords added yet</p>
              )}
            </div>
          </div>

          {/* SEO Score Preview */}
          {currentContent?.currentSEOScore > 0 && (
            <div className="sidebar-section">
              <h3>Current SEO Score</h3>
              <div className="score-preview">
                <div
                  className={`score-circle-large score-${
                    currentContent.currentSEOScore >= 80
                      ? 'excellent'
                      : currentContent.currentSEOScore >= 60
                      ? 'good'
                      : currentContent.currentSEOScore >= 40
                      ? 'average'
                      : 'poor'
                  }`}
                >
                  {currentContent.currentSEOScore}
                </div>
                <Link
                  to={`/content/${id}/analysis`}
                  className="btn btn-sm btn-outline"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="sidebar-section tips-section">
            <h3>💡 Quick Tips</h3>
            <ul>
              <li>Include primary keyword in title</li>
              <li>Use H2 headings for structure</li>
              <li>Aim for 1000+ words</li>
              <li>Add keywords naturally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
