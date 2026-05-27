import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, ShoppingCart, User, Star, Home, Truck, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';

const ADMIN_PASSWORD = '123456';
const CHECKOUT_LINK = 'https://mpago.la/1eZBHVj';
const STORE_WHATSAPP = '55119921145214';
const PAGE_SIZE = 24;

const categories = ['Todos','Destaques','Pianos Digitais','Teclados','Controladores','MIDI','Áudio','Pedais','Suportes','Acessórios','Promoções'];

const categoryImages = {
  'Pianos Digitais': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1200&auto=format&fit=crop',
  'Teclados': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
  'MIDI': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
  'Controladores': 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop',
  'Áudio': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop',
  'Pedais': 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1200&auto=format&fit=crop',
  'Suportes': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop',
  'Acessórios': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=1200&auto=format&fit=crop',
  'Promoções': 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1200&auto=format&fit=crop'
};

const reviews = [
  ['Lucas M.', 'Chegou antes do prazo. Produto original e muito bem embalado.'],
  ['Rafael S.', 'Melhor preço que encontrei. Atendimento rápido e loja confiável.'],
  ['Juliana A.', 'Comprei no Pix e economizei bastante. Recomendo a TeclaPrime.'],
  ['Felipe R.', 'Produto chegou certinho e a equipe mandou o rastreio no WhatsApp.']
];

const defaultProducts = [
  {id:'yamaha-psr-e283',sku:'TP-051',name:'Yamaha PSR-E283',category:'Teclados',competitorPrice:1499,price:1049,stock:5,image:categoryImages['Teclados'],description:'Teclado arranjador Yamaha com 61 teclas, timbres realistas, ritmos automáticos e ótimo custo-benefício para estudo, igreja e apresentações.',tag:'30% OFF NO PIX',rating:'4.9',featured:true},
  {id:'yamaha-p45',sku:'TP-054',name:'Yamaha P-45',category:'Pianos Digitais',competitorPrice:4999,price:3499,stock:3,image:categoryImages['Pianos Digitais'],description:'Piano digital Yamaha com 88 teclas pesadas, timbres expressivos e design compacto para estudo avançado, igrejas e apresentações profissionais.',tag:'DESTAQUE',rating:'5.0',featured:true},
  {id:'roland-fp10',sku:'TP-059',name:'Roland FP-10',category:'Pianos Digitais',competitorPrice:5299,price:3709,stock:4,image:categoryImages['Pianos Digitais'],description:'Piano digital Roland compacto com excelente resposta de teclas, som encorpado e construção premium.',tag:'MAIS VENDIDO',rating:'4.9',featured:true},
  {id:'akai-mpk-mini',sku:'TP-060',name:'Akai MPK Mini MK3',category:'MIDI',competitorPrice:699,price:489,stock:8,image:categoryImages['MIDI'],description:'Controlador MIDI compacto para produção musical, beats, home studio e criação profissional.',tag:'OFERTA PIX',rating:'4.8',featured:true}
];

function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function price30(v){return Math.round(Number(v||0)*0.7);}
function slug(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
function load(k,f){try{const s=localStorage.getItem(k);return s?JSON.parse(s):f}catch{return f}}
function save(k,v){localStorage.setItem(k,JSON.stringify(v));}
const gold = '#d4a24c';

function normalizeProduct(p, i=0){
  const category = p.category || p.categoria || 'Teclados';
  const competitorPrice = Number(p.competitorPrice || p.precoConcorrente || p.concorrente || 0);
  const price = Number(p.price || p.preco || p.precoTeclaPrime || price30(competitorPrice));
  const name = p.name || p.produto || '';
  return {
    id: p.id || slug(name || ('produto-'+Date.now()+'-'+i)),
    sku: p.sku || ('TP-' + String(Date.now()).slice(-6) + i),
    name,
    category,
    competitorPrice,
    price,
    stock: Number(p.stock || p.estoque || 1),
    image: p.image || p.imagem || categoryImages[category] || categoryImages['Teclados'],
    description: p.description || p.descricao || `${name} com excelente qualidade, preço especial no Pix e envio rápido pela TeclaPrime.`,
    tag: p.tag || '30% OFF NO PIX',
    rating: p.rating || '4.8',
    featured: !!p.featured
  };
}

function App(){
  const [page,setPage]=useState(location.pathname==='/admin'?'admin':'home');
  const [products,setProducts]=useState(load('teclaprime_products',defaultProducts));
  const [orders,setOrders]=useState(load('teclaprime_orders',[]));
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('Todos');
  const [visible,setVisible]=useState(PAGE_SIZE);

  useEffect(()=>save('teclaprime_products',products),[products]);
  useEffect(()=>save('teclaprime_orders',orders),[orders]);
  useEffect(()=>setVisible(PAGE_SIZE),[search,category]);

  const filtered=useMemo(()=>products.filter(p=>{
    const categoryOk = category==='Todos' || (category==='Destaques' ? p.featured : p.category===category);
    const searchOk = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return categoryOk && searchOk;
  }),[products,search,category]);

  const shown = filtered.slice(0, visible);
  const featured = products.filter(p=>p.featured).slice(0,8);

  function makeOrder(p){
    const orderId = 'TP-' + Date.now();
    const order = {id:orderId,date:new Date().toLocaleString('pt-BR'),customer:'Cliente online',phone:'',product:p.name,price:p.price,status:'Aguardando pagamento',tracking:''};
    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    save('teclaprime_orders', updatedOrders);
    const msg = `Olá, acabei de iniciar uma compra na TeclaPrime.\n\nPedido: ${orderId}\nProduto: ${p.name}\nValor no Pix: ${money(p.price)}\nValor no cartão/boleto: ${money(p.competitorPrice)}\nSKU: ${p.sku}\n\nVou finalizar o pagamento pelo link:\n${CHECKOUT_LINK}\n\nApós confirmar o pagamento, por favor enviar o código de rastreio aqui neste WhatsApp.`;
    window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`,'_blank');
  }

  if(page==='admin') return <Admin products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} goHome={()=>{history.pushState(null,'','/');setPage('home')}}/>;

  return <div style={{fontFamily:'Arial, Helvetica, sans-serif',background:'#050505',color:'#fff',minHeight:'100vh'}}>
    <header style={{background:'#030303',borderBottom:'1px solid rgba(212,162,76,.35)',position:'sticky',top:0,zIndex:20}}>
      <div style={{maxWidth:1280,margin:'auto',padding:'18px 22px',display:'grid',gridTemplateColumns:'330px 1fr 230px',gap:22,alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{width:56,height:56,borderRadius:18,background:'linear-gradient(135deg,#61400b,#e0b45b)',display:'grid',placeItems:'center',fontWeight:900,fontSize:22,color:'#050505'}}>TP</div>
          <div><h1 style={{margin:0,fontSize:34,letterSpacing:-1}}>Tecla<span style={{color:gold}}>Prime</span></h1><p style={{margin:'-2px 0 0',color:'#b8a37b',fontSize:11,letterSpacing:4}}>INSTRUMENTOS & ÁUDIO</p></div>
        </div>
        <div style={{display:'flex',border:'1px solid rgba(255,255,255,.18)',borderRadius:8,overflow:'hidden',background:'#080808'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Buscar produto, SKU ou categoria...' style={{flex:1,border:0,padding:'16px 18px',outline:0,background:'transparent',color:'#fff',fontSize:15}}/>
          <button style={{border:0,background:'transparent',color:'#fff',padding:'0 18px'}}><Search size={22}/></button>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:18}}>
          <button onClick={()=>{history.pushState(null,'','/admin');setPage('admin')}} style={{border:0,background:'transparent',color:'#fff',fontWeight:800,display:'flex',gap:8,alignItems:'center'}}><User color={gold}/> Admin</button>
          <button style={{border:0,background:'transparent',color:'#fff',fontWeight:800,display:'flex',gap:8,alignItems:'center'}}><ShoppingCart color={gold}/> Carrinho</button>
        </div>
      </div>
      <nav style={{borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',justifyContent:'center',gap:30,padding:'16px 18px',flexWrap:'wrap'}}>
        {categories.map(c=><a key={c} onClick={()=>setCategory(c)} style={{cursor:'pointer',fontWeight:900,fontSize:13,textTransform:'uppercase',color:category===c?gold:'#fff',borderBottom:category===c?`2px solid ${gold}`:'2px solid transparent',paddingBottom:8}}>{c}</a>)}
      </nav>
    </header>

    <section style={{position:'relative',minHeight:540,backgroundImage:'linear-gradient(90deg,rgba(0,0,0,.98) 0%,rgba(0,0,0,.86) 38%,rgba(0,0,0,.2) 100%), url(https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=1600&auto=format&fit=crop)',backgroundSize:'cover',backgroundPosition:'center right',borderBottom:'1px solid rgba(212,162,76,.35)'}}>
      <div style={{maxWidth:1280,margin:'auto',padding:'60px 22px'}}>
        <div style={{maxWidth:670}}>
          <h2 style={{fontFamily:'Georgia, serif',fontSize:72,lineHeight:.95,margin:'0 0 18px',fontWeight:700}}><span style={{color:gold}}>Chance Única</span><br/>TeclaPrime</h2>
          <p style={{fontFamily:'Georgia, serif',fontSize:25,lineHeight:1.35,margin:'22px 0'}}>Instrumentos selecionados com <span style={{color:gold}}>30% OFF no Pix</span>.</p>
          <p style={{fontSize:18,lineHeight:1.5,color:'#ddd',maxWidth:570,borderLeft:`2px solid ${gold}`,paddingLeft:22}}>No cartão ou boleto vale o preço normal. No Pix você garante o maior desconto da TeclaPrime.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,margin:'34px 0',maxWidth:720}}>
            {[['Envio rápido','para todo o Brasil',Truck],['Compra segura','site protegido',ShieldCheck],['Cartão/Boleto','preço normal',CreditCard],['30% OFF','somente Pix',MessageCircle]].map(([a,b,Icon])=><div key={a} style={{display:'flex',gap:9,alignItems:'center'}}><Icon color={gold}/><div><b style={{fontSize:12,textTransform:'uppercase'}}>{a}</b><br/><span style={{fontSize:12,color:'#bbb'}}>{b}</span></div></div>)}
          </div>
          <button onClick={()=>window.scrollTo({top:760,behavior:'smooth'})} style={{background:'transparent',border:`1px solid ${gold}`,color:gold,borderRadius:6,padding:'17px 58px',fontWeight:900,fontSize:16}}>VER OFERTAS</button>
        </div>
      </div>
    </section>

    <main style={{maxWidth:1280,margin:'auto',padding:'0 22px 60px'}}>
      <section style={{border:'1px solid rgba(212,162,76,.5)',borderRadius:12,marginTop:0,padding:'20px 28px 30px',background:'rgba(0,0,0,.75)'}}>
        <p style={{margin:0,color:gold,fontWeight:900,textTransform:'uppercase',letterSpacing:1}}>Vitrine Premium</p>
        <h3 style={{fontFamily:'Georgia, serif',fontSize:31,marginTop:0}}>Melhores ofertas em destaque</h3>
        <ProductGrid products={featured.length?featured:products.slice(0,8)} makeOrder={makeOrder}/>
      </section>

      <section style={{marginTop:35}}>
        <h3 style={{fontFamily:'Georgia, serif',fontSize:30}}>Catálogo completo ({filtered.length} produtos)</h3>
        <ProductGrid products={shown} makeOrder={makeOrder}/>
        {visible < filtered.length && <button onClick={()=>setVisible(visible+PAGE_SIZE)} style={{margin:'28px auto',display:'block',background:'transparent',border:`1px solid ${gold}`,color:gold,borderRadius:8,padding:'14px 40px',fontWeight:900}}>MOSTRAR MAIS PRODUTOS</button>}
      </section>

      <section style={{marginTop:45,border:'1px solid rgba(212,162,76,.45)',borderRadius:12,padding:28,background:'#080808'}}>
        <p style={{color:gold,fontWeight:900,textTransform:'uppercase'}}>Avaliações de clientes</p>
        <h3 style={{fontFamily:'Georgia, serif',fontSize:30,marginTop:0}}>Quem comprou recomenda</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:18}}>
          {reviews.map(([name,text])=><div key={name} style={{background:'#0d0d0d',border:'1px solid rgba(212,162,76,.25)',borderRadius:12,padding:18}}>
            <div style={{color:gold}}>★★★★★</div><p style={{color:'#ddd',lineHeight:1.45}}>"{text}"</p><b>{name}</b>
          </div>)}
        </div>
      </section>
    </main>
  </div>
}

function ProductGrid({products,makeOrder}){
  return <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:22}}>
    {products.map(p=><article key={p.id} style={{background:'linear-gradient(180deg,#0c0c0c,#050505)',border:'1px solid rgba(212,162,76,.45)',borderRadius:16,overflow:'hidden',boxShadow:'0 18px 45px rgba(0,0,0,.55)'}}>
      <div style={{height:210,position:'relative',background:'#030303'}}><img alt={p.name} src={p.image} loading='lazy' style={{width:'100%',height:'100%',objectFit:'cover',opacity:.92}}/><span style={{position:'absolute',top:12,left:12,background:'linear-gradient(135deg,#9a670e,#e0b45b)',color:'#fff',borderRadius:4,padding:'7px 11px',fontWeight:900,fontSize:12}}>{p.tag||'30% OFF NO PIX'}</span></div>
      <div style={{padding:18}}>
        <div style={{color:gold,fontWeight:800,fontSize:13,display:'flex',gap:7,alignItems:'center'}}><Star size={15} fill='currentColor'/> {p.rating||'4.8'} <span style={{color:'#777'}}> | SKU: {p.sku}</span></div>
        <h4 style={{fontSize:17,minHeight:42}}>{p.name}</h4>
        <p style={{fontSize:13,color:'#ccc',lineHeight:1.35,minHeight:72}}>{p.description}</p>
        <p style={{color:'#aaa',margin:'8px 0 2px'}}>Cartão/Boleto: <b>{money(p.competitorPrice)}</b></p>
        <p style={{fontSize:25,fontWeight:900,margin:'2px 0',color:gold}}>Pix: {money(p.price)}</p>
        <button onClick={()=>makeOrder(p)} style={{width:'100%',border:0,borderRadius:7,background:'linear-gradient(135deg,#a87118,#dfad4a)',color:'#fff',padding:14,fontWeight:900,fontSize:15}}><ShoppingCart size={18}/> COMPRAR</button>
      </div>
    </article>)}
  </div>
}

function Admin({products,setProducts,orders,setOrders,goHome}){
  const [logged,setLogged]=useState(localStorage.getItem('teclaprime_admin')==='yes');
  const [password,setPassword]=useState('');
  const empty={id:'',name:'',sku:'',category:'Pianos Digitais',competitorPrice:'',price:'',stock:'',image:'',description:'',tag:'30% OFF NO PIX',rating:'4.8',featured:false};
  const [form,setForm]=useState(empty);
  const [importText,setImportText]=useState('');

  function login(){if(password===ADMIN_PASSWORD){localStorage.setItem('teclaprime_admin','yes');setLogged(true)}else alert('Senha errada. Senha inicial: 123456')}
  function edit(p){setForm(p);scrollTo(0,0)}
  function remove(id){if(confirm('Apagar esse produto?'))setProducts(products.filter(p=>p.id!==id))}
  function submit(e){e.preventDefault();const item=normalizeProduct({...form,featured:!!form.featured});const exists=products.some(p=>p.id===item.id);setProducts(exists?products.map(p=>p.id===item.id?item:p):[item,...products]);setForm(empty);alert('Produto salvo!')}
  function importProducts(){try{const list=JSON.parse(importText);if(!Array.isArray(list)){alert('O JSON precisa ser uma lista.');return}const normalized=list.map(normalizeProduct).filter(p=>p.name);setProducts([...normalized,...products]);setImportText('');alert(normalized.length+' produtos importados!')}catch(e){alert('JSON inválido. Copie tudo novamente.')}}

  if(!logged)return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#050505',fontFamily:'Arial'}}><div style={{background:'#0b0b0b',border:`1px solid ${gold}`,color:'#fff',borderRadius:20,padding:32,maxWidth:380,width:'92%'}}><h1>Painel TeclaPrime</h1><input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='Senha' style={{width:'100%',padding:14,border:`1px solid ${gold}`,borderRadius:10,background:'#050505',color:'#fff'}}/><button onClick={login} style={{width:'100%',border:0,background:gold,color:'#fff',borderRadius:10,padding:14,fontWeight:900,marginTop:10}}>Entrar</button><small>Senha inicial: 123456</small></div></div>;

  return <div style={{fontFamily:'Arial',display:'grid',gridTemplateColumns:'250px 1fr',minHeight:'100vh',background:'#050505',color:'#fff'}}>
    <aside style={{background:'#020202',color:'#fff',padding:24,borderRight:`1px solid ${gold}`}}><h2>TeclaPrime</h2><button onClick={goHome}><Home size={16}/> Ver loja</button></aside>
    <main style={{padding:26}}>
      <h1>Painel de Produtos</h1>
      <form onSubmit={submit} style={{background:'#0b0b0b',border:`1px solid ${gold}`,borderRadius:20,padding:22,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder='Nome do produto' required/>
        <input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} placeholder='SKU'/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.filter(c=>c!=='Todos'&&c!=='Destaques').map(c=><option key={c}>{c}</option>)}</select>
        <input type='number' value={form.competitorPrice} onChange={e=>setForm({...form,competitorPrice:e.target.value})} placeholder='Preço cartão/boleto'/>
        <input type='number' value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder='Preço Pix'/>
        <button type='button' onClick={()=>setForm({...form,price:price30(form.competitorPrice)})}>Aplicar -30% Pix</button>
        <input type='number' value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder='Estoque'/>
        <input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder='URL da foto'/>
        <label><input type='checkbox' checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Mostrar na tela inicial</label>
        <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder='Descrição do produto' style={{gridColumn:'1/-1',minHeight:90}}/>
        <button style={{gridColumn:'1/-1',background:gold,color:'#fff',border:0,borderRadius:10,padding:14,fontWeight:900}}>Salvar produto</button>
      </form>

      <section style={{background:'#0b0b0b',border:`1px solid ${gold}`,borderRadius:20,padding:22,marginTop:22}}>
        <h2>Importar produtos em massa</h2>
        <p>Agora pode importar muitos produtos. O site mostra por página para não travar.</p>
        <textarea value={importText} onChange={e=>setImportText(e.target.value)} placeholder='Cole o JSON aqui...' style={{width:'100%',minHeight:190,background:'#050505',color:'#fff',border:`1px solid ${gold}`,borderRadius:10,padding:14,fontFamily:'monospace'}}/>
        <button type='button' onClick={importProducts} style={{marginTop:12,background:gold,color:'#fff',border:0,borderRadius:10,padding:'14px 22px',fontWeight:900}}>Importar produtos</button>
      </section>

      <h2>Produtos cadastrados ({products.length})</h2>
      {products.slice(0,80).map(p=><div key={p.id} style={{background:'#0b0b0b',border:'1px solid rgba(212,162,76,.35)',padding:12,display:'grid',gridTemplateColumns:'70px 1fr 170px 60px 70px',gap:12,alignItems:'center'}}><img alt={p.name} src={p.image} style={{width:65,height:50,objectFit:'cover'}}/><div><b>{p.name}</b><br/><small>{p.sku} | {p.category} | Estoque: {p.stock} {p.featured?'| Destaque':''}</small></div><div><span>Cartão: {money(p.competitorPrice)}</span><br/><b style={{color:gold}}>Pix: {money(p.price)}</b></div><button onClick={()=>edit(p)}>Editar</button><button onClick={()=>remove(p.id)}>Excluir</button></div>)}
      <h2>Pedidos</h2>{orders.length===0?<p>Nenhum pedido ainda.</p>:orders.map(o=><p key={o.id}>{o.id} - {o.product} - {money(o.price)}</p>)}
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
