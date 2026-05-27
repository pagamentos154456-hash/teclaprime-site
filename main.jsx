import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingCart, User, Star, Plus, Pencil, Trash2, Save, Home, Truck, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';

const ADMIN_PASSWORD = '123456';
const CHECKOUT_LINK = 'https://mpago.la/1eZBHVj';
const STORE_WHATSAPP = '55119921145214';

const categories = ['Todos','Pianos Digitais','Teclados','Controladores','Pedais','Suportes','Áudio','Acessórios','Promoções'];

const defaultProducts = [
  {id:'piano-harmonia-px88',name:'Piano Digital Harmonia PX-88',sku:'TP-PX88',category:'Pianos Digitais',competitorPrice:4999,price:3499,stock:8,image:'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1200&auto=format&fit=crop',description:'Piano digital com 88 teclas, timbres realistas, design moderno e excelente resposta para estudo, igreja, palco e home studio.',tag:'30% OFF',rating:'4.9'},
  {id:'teclado-maestro-61',name:'Teclado Arranjador Maestro 61',sku:'TP-MA61',category:'Teclados',competitorPrice:2199,price:1539,stock:12,image:'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',description:'Teclado arranjador com 61 teclas, ritmos, timbres, acompanhamento automático e recursos ideais para iniciantes e músicos práticos.',tag:'OFERTA',rating:'4.8'},
  {id:'pedal-sustain-prostage',name:'Pedal Sustain ProStage',sku:'TP-PS01',category:'Pedais',competitorPrice:249,price:174,stock:30,image:'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200&auto=format&fit=crop',description:'Pedal sustain resistente, compatível com diversos teclados e pianos digitais. Ideal para estudo, gravação e apresentações.',tag:'MAIS VENDIDO',rating:'4.7'},
  {id:'suporte-x-duplo',name:'Suporte X Duplo Reforçado',sku:'TP-SX02',category:'Suportes',competitorPrice:399,price:279,stock:20,image:'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop',description:'Suporte em X duplo reforçado para teclados e pianos digitais, com regulagem de altura e estrutura estável.',tag:'30% OFF',rating:'4.9'}
];

function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function price30(v){return Math.round(Number(v||0)*0.7);}
function slug(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
function load(k,f){try{const s=localStorage.getItem(k);return s?JSON.parse(s):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v));}

const styles = {
  page:{fontFamily:'Arial, Helvetica, sans-serif',background:'#050505',color:'#fff',minHeight:'100vh'},
  gold:'#c9932f',
  gold2:'#e0b45b',
  card:{background:'linear-gradient(180deg,#0c0c0c,#050505)',border:'1px solid rgba(201,147,47,.45)',borderRadius:16,overflow:'hidden',boxShadow:'0 18px 45px rgba(0,0,0,.55)'}
};

function App(){
  const [page,setPage]=useState(location.pathname==='/admin'?'admin':'home');
  const [products,setProducts]=useState(load('teclaprime_products',defaultProducts));
  const [orders,setOrders]=useState(load('teclaprime_orders',[]));
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('Todos');

  useEffect(()=>save('teclaprime_products',products),[products]);
  useEffect(()=>save('teclaprime_orders',orders),[orders]);

  const filtered=useMemo(()=>products.filter(p=>
    (category==='Todos'||p.category===category) &&
    (p.name.toLowerCase().includes(search.toLowerCase())||p.sku.toLowerCase().includes(search.toLowerCase()))
  ),[products,search,category]);

  function makeOrder(p){
    const orderId = 'TP-' + Date.now();
    const order = {
      id: orderId,
      date: new Date().toLocaleString('pt-BR'),
      customer: 'Cliente online',
      phone: '',
      product: p.name,
      price: p.price,
      status: 'Aguardando pagamento',
      tracking: ''
    };
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    save('teclaprime_orders', updatedOrders);

    const message = `Olá, acabei de iniciar uma compra na TeclaPrime.

Pedido: ${orderId}
Produto: ${p.name}
Valor: ${money(p.price)}
SKU: ${p.sku}

Vou finalizar o pagamento pelo link:
${CHECKOUT_LINK}

Após confirmar o pagamento, por favor encaminhar o código de rastreio aqui neste WhatsApp.`;
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank');
  }

  if(page==='admin'){
    return <Admin products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} goHome={()=>{history.pushState(null,'','/');setPage('home')}}/>;
  }

  return <div style={styles.page}>
    <header style={{background:'#030303',borderBottom:'1px solid rgba(201,147,47,.25)',position:'sticky',top:0,zIndex:20}}>
      <div style={{maxWidth:1280,margin:'auto',padding:'18px 22px',display:'grid',gridTemplateColumns:'330px 1fr 260px',gap:22,alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:56,height:56,borderRadius:18,background:'linear-gradient(135deg,#5c3b08,#d4a24c)',display:'grid',placeItems:'center',fontWeight:900,fontSize:22,color:'#050505'}}>TP</div>
          <div><h1 style={{margin:0,fontSize:34,letterSpacing:-1,color:'#fff'}}>Tecla<span style={{color:styles.gold2}}>Prime</span></h1><p style={{margin:'-2px 0 0',color:'#b8a37b',fontSize:11,letterSpacing:5}}>INSTRUMENTOS & ÁUDIO</p></div>
        </div>

        <div style={{display:'flex',border:'1px solid rgba(255,255,255,.18)',borderRadius:8,overflow:'hidden',background:'#080808'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Buscar produto...' style={{flex:1,border:0,padding:'16px 18px',outline:0,background:'transparent',color:'#fff',fontSize:15}}/>
          <button style={{border:0,background:'transparent',color:'#fff',padding:'0 18px'}}><Search size={22}/></button>
        </div>

        <div style={{display:'flex',justifyContent:'flex-end',gap:18}}>
          <button onClick={()=>{history.pushState(null,'','/admin');setPage('admin')}} style={{border:0,background:'transparent',color:'#fff',fontWeight:800,display:'flex',gap:8,alignItems:'center'}}><User color={styles.gold2}/> Admin</button>
          <button style={{border:0,background:'transparent',color:'#fff',fontWeight:800,display:'flex',gap:8,alignItems:'center'}}><ShoppingCart color={styles.gold2}/> Carrinho</button>
        </div>
      </div>

      <nav style={{borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',justifyContent:'center',gap:42,padding:'16px 18px',flexWrap:'wrap'}}>
        {categories.map(c=><a key={c} onClick={()=>setCategory(c)} style={{cursor:'pointer',fontWeight:900,fontSize:14,textTransform:'uppercase',color:category===c?styles.gold2:'#fff',borderBottom:category===c?`2px solid ${styles.gold2}`:'2px solid transparent',paddingBottom:8}}>{c}</a>)}
      </nav>
    </header>

    <section style={{position:'relative',minHeight:520,backgroundImage:'linear-gradient(90deg,rgba(0,0,0,.98) 0%,rgba(0,0,0,.85) 37%,rgba(0,0,0,.18) 100%), url(https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1600&auto=format&fit=crop)',backgroundSize:'cover',backgroundPosition:'center right',borderBottom:'1px solid rgba(201,147,47,.35)'}}>
      <div style={{maxWidth:1280,margin:'auto',padding:'55px 22px'}}>
        <div style={{maxWidth:620}}>
          <div style={{display:'flex',alignItems:'center',gap:10,color:styles.gold2,marginBottom:12}}><div style={{height:1,background:styles.gold2,width:150}}></div><span>♛</span><div style={{height:1,background:styles.gold2,width:150}}></div></div>
          <h2 style={{fontFamily:'Georgia, serif',fontSize:72,lineHeight:.95,margin:'0 0 18px',fontWeight:700}}><span style={{color:styles.gold2}}>Chance Única</span><br/><span style={{color:'#fff'}}>TeclaPrime</span></h2>
          <div style={{height:1,background:styles.gold2,width:420,margin:'18px 0'}}></div>
          <p style={{fontFamily:'Georgia, serif',fontSize:25,lineHeight:1.35,color:'#fff',margin:'22px 0'}}>Alguns instrumentos acompanham você por anos.<br/>Algumas condições aparecem <span style={{color:styles.gold2}}>por tempo limitado.</span></p>
          <p style={{fontSize:22,lineHeight:1.4,color:'#ddd',maxWidth:520,borderLeft:`2px solid ${styles.gold2}`,paddingLeft:22}}>Pianos, órgãos, teclados e instrumentos selecionados com condição especial.</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,margin:'34px 0',maxWidth:690}}>
            {[['Envio rápido','para todo o Brasil',Truck],['Compra segura','site 100% seguro',ShieldCheck],['Até 12x','no cartão',CreditCard],['Atendimento','via WhatsApp',MessageCircle]].map(([a,b,Icon])=><div key={a} style={{display:'flex',gap:9,alignItems:'center'}}><Icon color={styles.gold2}/><div><b style={{fontSize:12,textTransform:'uppercase'}}>{a}</b><br/><span style={{fontSize:12,color:'#bbb'}}>{b}</span></div></div>)}
          </div>

          <button onClick={()=>window.scrollTo({top:720,behavior:'smooth'})} style={{background:'transparent',border:`1px solid ${styles.gold2}`,color:styles.gold2,borderRadius:6,padding:'17px 58px',fontWeight:900,fontSize:16,letterSpacing:.5}}>VER OFERTAS</button>
        </div>
      </div>
    </section>

    <main style={{maxWidth:1280,margin:'auto',padding:'0 22px 60px'}}>
      <section style={{border:`1px solid rgba(201,147,47,.5)`,borderRadius:12,marginTop:0,padding:'18px 28px 28px',background:'rgba(0,0,0,.75)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
          <div><p style={{margin:0,color:styles.gold2,fontWeight:900,textTransform:'uppercase',letterSpacing:1}}>Produtos</p><h3 style={{fontFamily:'Georgia, serif',fontSize:30,margin:0}}>Catálogo TeclaPrime</h3></div>
          <button onClick={()=>{history.pushState(null,'','/admin');setPage('admin')}} style={{background:'transparent',border:`1px solid ${styles.gold2}`,color:styles.gold2,borderRadius:6,padding:'13px 25px',fontWeight:900}}>CADASTRAR PRODUTO</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:22}}>
          {filtered.map(p=><article key={p.id} style={styles.card}>
            <div style={{height:210,position:'relative',background:'#030303'}}>
              <img alt={p.name} src={p.image} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.9}}/>
              <span style={{position:'absolute',top:12,left:12,background:'linear-gradient(135deg,#9a670e,#e0b45b)',color:'#fff',borderRadius:4,padding:'7px 11px',fontWeight:900,fontSize:12,textShadow:'0 1px 1px #000'}}>{p.tag}</span>
            </div>
            <div style={{padding:18}}>
              <div style={{color:styles.gold2,fontWeight:800,fontSize:13,display:'flex',gap:7,alignItems:'center'}}><Star size={15} fill='currentColor'/> {p.rating} <span style={{color:'#777'}}> | SKU: {p.sku}</span></div>
              <h4 style={{fontSize:17,color:'#fff',minHeight:42}}>{p.name}</h4>
              <p style={{fontSize:13,color:'#ccc',lineHeight:1.35,minHeight:72}}>{p.description}</p>
              <p style={{textDecoration:'line-through',color:'#888',margin:'10px 0 2px'}}>{money(p.competitorPrice)}</p>
              <p style={{fontSize:24,fontWeight:900,margin:'2px 0',color:styles.gold2}}>{money(p.price)}</p>
              <p style={{fontSize:13,color:'#aaa'}}>Estoque: {p.stock} | até 12x</p>
              <button onClick={()=>makeOrder(p)} style={{width:'100%',border:0,borderRadius:7,background:'linear-gradient(135deg,#a87118,#dfad4a)',color:'#fff',padding:14,fontWeight:900,fontSize:15,letterSpacing:.4}}><ShoppingCart size={18}/> COMPRAR</button>
            </div>
          </article>)}
        </div>
      </section>
    </main>
  </div>;
}

function Admin({products,setProducts,orders,setOrders,goHome}){
  const [logged,setLogged]=useState(localStorage.getItem('teclaprime_admin')==='yes');
  const [password,setPassword]=useState('');
  const empty={id:'',name:'',sku:'',category:'Pianos Digitais',competitorPrice:'',price:'',stock:'',image:'',description:'',tag:'30% OFF',rating:'4.8'};
  const [form,setForm]=useState(empty);
  const [importText,setImportText]=useState('');

  function login(){if(password===ADMIN_PASSWORD){localStorage.setItem('teclaprime_admin','yes');setLogged(true)}else alert('Senha errada. Senha inicial: 123456')}
  function edit(p){setForm(p);scrollTo(0,0)}
  function remove(id){if(confirm('Apagar esse produto?'))setProducts(products.filter(p=>p.id!==id))}
  function submit(e){e.preventDefault();const item={...form,id:form.id||slug(form.name)||'produto-'+Date.now(),competitorPrice:Number(form.competitorPrice||0),price:Number(form.price||price30(form.competitorPrice)),stock:Number(form.stock||0)};const exists=products.some(p=>p.id===item.id);setProducts(exists?products.map(p=>p.id===item.id?item:p):[item,...products]);setForm(empty);alert('Produto salvo!')}

  function importProducts(){
    try{
      const list = JSON.parse(importText);
      if(!Array.isArray(list)){ alert('O JSON precisa começar com [ e terminar com ].'); return; }
      const normalized = list.map((p,index)=>({
        id: p.id || slug(p.name || p.produto || ('produto-'+Date.now()+'-'+index)),
        name: p.name || p.produto || '',
        sku: p.sku || ('TP-'+String(Date.now()).slice(-5)+index),
        category: p.category || p.categoria || 'Teclados',
        competitorPrice: Number(p.competitorPrice || p.precoConcorrente || p.concorrente || 0),
        price: Number(p.price || p.preco || p.precoTeclaPrime || price30(p.competitorPrice || p.precoConcorrente || p.concorrente || 0)),
        stock: Number(p.stock || p.estoque || 1),
        image: p.image || p.imagem || '',
        description: p.description || p.descricao || '',
        tag: p.tag || '30% OFF',
        rating: p.rating || '4.8'
      })).filter(p=>p.name);
      setProducts([...normalized, ...products]);
      setImportText('');
      alert(normalized.length + ' produtos importados!');
    }catch(e){
      alert('JSON inválido. Confere se copiou tudo certinho.');
    }
  }

  if(!logged)return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#050505',fontFamily:'Arial'}}><div style={{background:'#0b0b0b',border:'1px solid #c9932f',color:'#fff',borderRadius:20,padding:32,maxWidth:380,width:'92%'}}><h1>Painel TeclaPrime</h1><p>Digite a senha.</p><input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Senha' style={{width:'100%',padding:14,border:'1px solid #c9932f',borderRadius:10,background:'#050505',color:'#fff'}}/><button onClick={login} style={{width:'100%',border:0,background:'#c9932f',color:'#fff',borderRadius:10,padding:14,fontWeight:900,marginTop:10}}>Entrar</button><small>Senha inicial: 123456</small></div></div>;

  return <div style={{fontFamily:'Arial',display:'grid',gridTemplateColumns:'250px 1fr',minHeight:'100vh',background:'#050505',color:'#fff'}}>
    <aside style={{background:'#020202',color:'#fff',padding:24,borderRight:'1px solid #c9932f'}}><h2>TeclaPrime</h2><button onClick={goHome}>Ver loja</button><button>Produtos</button><button>Pedidos</button></aside>
    <main style={{padding:26}}>
      <h1>Painel de Produtos</h1>
      <form onSubmit={submit} style={{background:'#0b0b0b',border:'1px solid #c9932f',borderRadius:20,padding:22,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <h3 style={{gridColumn:'1/-1'}}>Cadastrar / Editar produto</h3>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder='Nome do produto' required/>
        <input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} placeholder='SKU'/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(c=>c!=='Todos').map(c=><option key={c}>{c}</option>)}</select>
        <input type='number' value={form.competitorPrice} onChange={e=>setForm({...form,competitorPrice:e.target.value})} placeholder='Preço concorrente'/>
        <input type='number' value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder='Seu preço'/>
        <button type='button' onClick={()=>setForm({...form,price:price30(form.competitorPrice)})}>Aplicar -30%</button>
        <input type='number' value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder='Estoque'/>
        <input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder='URL da foto'/>
        <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder='Descrição do produto' style={{gridColumn:'1/-1',minHeight:90}}/>
        <button style={{gridColumn:'1/-1',background:'#c9932f',color:'#fff',border:0,borderRadius:10,padding:14,fontWeight:900}}>Salvar produto</button>
      </form>
      <section style={{background:'#0b0b0b',border:'1px solid #c9932f',borderRadius:20,padding:22,marginTop:22}}>
        <h2 style={{marginTop:0}}>Importar produtos em massa</h2>
        <p style={{color:'#cfcfcf'}}>Cole aqui uma lista JSON com vários produtos e clique em importar.</p>
        <textarea value={importText} onChange={e=>setImportText(e.target.value)} placeholder='Cole o JSON aqui...' style={{width:'100%',minHeight:190,background:'#050505',color:'#fff',border:'1px solid #c9932f',borderRadius:10,padding:14,fontFamily:'monospace'}}/>
        <button type='button' onClick={importProducts} style={{marginTop:12,background:'#c9932f',color:'#fff',border:0,borderRadius:10,padding:'14px 22px',fontWeight:900}}>Importar produtos</button>
      </section>
      <h2>Produtos cadastrados</h2>
      {products.map(p=><div key={p.id} style={{background:'#0b0b0b',border:'1px solid rgba(201,147,47,.35)',padding:12,display:'grid',gridTemplateColumns:'70px 1fr 150px 55px 60px',gap:12,alignItems:'center'}}><img alt={p.name} src={p.image} style={{width:65,height:50,objectFit:'cover'}}/><div><b>{p.name}</b><br/><small>{p.sku} | {p.category} | Estoque: {p.stock}</small></div><div><span style={{textDecoration:'line-through',color:'#888'}}>{money(p.competitorPrice)}</span><br/><b style={{color:'#c9932f'}}>{money(p.price)}</b></div><button onClick={()=>edit(p)}>Editar</button><button onClick={()=>remove(p.id)}>Excluir</button></div>)}
      <h2>Pedidos</h2>{orders.length===0?<p>Nenhum pedido ainda.</p>:orders.map(o=><p key={o.id}>{o.customer} - {o.product}</p>)}
    </main>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
