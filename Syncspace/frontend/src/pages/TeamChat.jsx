import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MessageAPI } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import { PageLoading, ErrorState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { formatClockTime, formatDate } from '../utils/format';

function dayKey(dateStr) {
  return new Date(dateStr).toDateString();
}

export default function TeamChat() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { workspace } = useWorkspaceRoom();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    MessageAPI.list(workspaceId)
      .then((data) => setMessages(data.messages))
      .catch(() => setError('Could not load chat history.'))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  useEffect(load, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (m) => {
      if (m.workspace_id === workspaceId) setMessages((prev) => [...prev, m]);
    };
    const onTyping = ({ userId, name, isTyping }) => {
      if (userId === user.id) return;
      setTypingUsers((prev) => {
        const next = { ...prev };
        if (isTyping) next[userId] = name;
        else delete next[userId];
        return next;
      });
    };
    socket.on('chat:message', onMessage);
    socket.on('chat:typing', onTyping);
    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:typing', onTyping);
    };
  }, [socket, workspaceId, user.id]);

  function handleTyping(value) {
    setDraft(value);
    if (!socket) return;
    socket.emit('chat:typing', { workspaceId, isTyping: true });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('chat:typing', { workspaceId, isTyping: false }), 1500);
  }

  async function handleSend(e) {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setDraft('');
    setSending(true);
    try {
      await MessageAPI.send(workspaceId, content);
      socket?.emit('chat:typing', { workspaceId, isTyping: false });
    } catch (err) {
      setError('Message failed to send.');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <PageLoading />;
  if (error && messages.length === 0) return <ErrorState message={error} onRetry={load} />;

  let lastDay = null;
  const typingNames = Object.values(typingUsers);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Team chat</h1>
          <p>{workspace?.name} · everyone in this workspace sees messages instantly.</p>
        </div>
      </div>

      <div className="chat-layout">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <EmptyState icon="chat" title="No messages yet" description="Say hello to get the conversation started." />
          ) : (
            messages.map((m) => {
              const showDivider = dayKey(m.created_at) !== lastDay;
              lastDay = dayKey(m.created_at);
              return (
                <div key={m.id}>
                  {showDivider && <div className="chat-day-divider">{formatDate(m.created_at)}</div>}
                  <div className="chat-row">
                    <Avatar name={m.sender_name} color={m.sender_color} size="md" />
                    <div className="bubble-col">
                      <div className="meta">
                        <span className="name">{m.sender_name}</span>
                        <span className="time">{formatClockTime(m.created_at)}</span>
                      </div>
                      <div className="text">{m.content}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
        <div className="chat-typing">
          {typingNames.length > 0 && `${typingNames.join(', ')} ${typingNames.length === 1 ? 'is' : 'are'} typing…`}
        </div>
        <form className="chat-input-bar" onSubmit={handleSend}>
          <textarea
            rows={1}
            placeholder="Message your team…"
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button className="btn btn-primary" type="submit" disabled={!draft.trim() || sending}>
            <Icon name="send" size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
