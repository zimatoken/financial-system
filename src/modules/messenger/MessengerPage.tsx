import { useState, useRef, useEffect } from 'react';
import { P2PManager } from '../../core/p2p';
import { useDataStore } from '../../hooks/useDataStore';
import { Send, Paperclip, Camera, UserPlus } from 'lucide-react';
import type { TranslationKey, Message } from '../../types';

interface Props {
  store: ReturnType<typeof useDataStore>;
  t: (key: TranslationKey) => string;
}

export default function MessengerPage({ store, t }: Props) {
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sdpInput, setSdpInput] = useState('');
  const [mySdp, setMySdp] = useState('');
  const p2p = useRef(new P2PManager()).current;
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    p2p.onData((data: any) => {
      if (data.type === 'message') {
        store.addMessage({ ...data.payload, status: 'delivered' });
      }
    });

    p2p.onConnect(() => {
      console.log('P2P: соединение установлено');
    });

    p2p.onDisconnect(() => {
      console.log('P2P: соединение разорвано');
    });

    p2p.onError((err) => {
      console.error('P2P:', err.message);
    });

    // Закрываем соединение при уходе со страницы
    return () => {
      p2p.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.data.messages]);

  const createOffer = async () => {
    try {
      const sdp = await p2p.createOffer();
      setMySdp(sdp);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const connect = async () => {
    if (!sdpInput) return;
    try {
      // Парсим JSON вместо ненадёжного поиска подстроки
      const parsed = JSON.parse(sdpInput);
      if (parsed.type === 'answer') {
        await p2p.acceptAnswer(sdpInput);
      } else {
        const answer = await p2p.acceptOffer(sdpInput);
        setMySdp(answer);
      }
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const sendMessage = () => {
    if (!text.trim() || !activeContact) return;
    const msg: Message = {
      id: crypto.randomUUID(),
      from: store.data.profile.id,
      to: activeContact,
      text,
      timestamp: Date.now(),
      status: 'pending',
    };
    store.addMessage(msg);
    p2p.send({ type: 'message', payload: msg });
    setText('');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact) return;
    const reader = new FileReader();
    reader.onload = () => {
      const msg: Message = {
        id: crypto.randomUUID(),
        from: store.data.profile.id,
        to: activeContact,
        text: `📎 ${file.name}`,
        timestamp: Date.now(),
        status: 'pending',
        file: { name: file.name, size: file.size, data: reader.result as string, type: file.type },
      };
      store.addMessage(msg);
      p2p.send({ type: 'message', payload: msg });
    };
    reader.readAsDataURL(file);
  };

  const contacts = store.data.contacts;
  const messages = store.data.messages.filter(m => m.from === activeContact || m.to === activeContact);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', gap: 16, height: 'calc(100vh - 140px)' }}>
      <div className="card" style={{ width: 280, display: 'flex', flexDirection: 'column' }}>
        <h3>{t('contacts')}</h3>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto' }}>
          {contacts.length === 0 && <div style={{ color: 'var(--subtext)', fontSize: 13 }}>Нет контактов</div>}
          {contacts.map(c => (
            <button key={c.id} className={`btn ${activeContact === c.id ? '' : 'btn-secondary'}`} onClick={() => setActiveContact(c.id)} style={{ justifyContent: 'flex-start' }}>
              <UserPlus size={16} /> {c.name}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <button className="btn" onClick={createOffer} style={{ width: '100%', marginBottom: 8 }}>Создать SDP</button>
          {mySdp && <textarea className="input" value={mySdp} readOnly style={{ height: 60, fontSize: 11, marginBottom: 8 }} />}
          <textarea className="input" value={sdpInput} onChange={e => setSdpInput(e.target.value)} placeholder="Вставьте SDP" style={{ height: 60, fontSize: 11, marginBottom: 8 }} />
          <button className="btn btn-success" onClick={connect} style={{ width: '100%' }}>{t('connect')}</button>
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, padding: '0.5rem' }}>
          {messages.length === 0 && <div style={{ color: 'var(--subtext)', textAlign: 'center', marginTop: 40 }}>Выберите контакт или создайте P2P-соединение</div>}
          {messages.map(m => (
            <div key={m.id} style={{ alignSelf: m.from === store.data.profile.id ? 'flex-end' : 'flex-start', background: m.from === store.data.profile.id ? 'var(--primary)' : 'var(--border)', padding: '8px 12px', borderRadius: 12, maxWidth: '70%', color: m.from === store.data.profile.id ? '#fff' : 'var(--text)' }}>
              <div>{m.text}</div>
              {m.file && <a href={m.file.data} download={m.file.name} style={{ color: 'inherit', textDecoration: 'underline', fontSize: 12 }}>📎 Скачать</a>}
              <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder={t('send')} style={{ flex: 1 }} />
          <input type="file" ref={fileRef} style={{ display: 'none' }} onChange={handleFile} />
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}><Paperclip size={18} /></button>
          <button className="btn btn-secondary"><Camera size={18} /></button>
          <button className="btn" onClick={sendMessage}><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
}
