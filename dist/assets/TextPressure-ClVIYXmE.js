import{r as s,T as J,j as x}from"./index-DjAP3G9G.js";const Q=({text:v="CODE & DESIGN",fontFamily:y="Compressa VF",fontUrl:B="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2",width:p=!0,weight:R=!0,italic:E=!0,alpha:F=!1,flex:D=!0,stroke:C=!1,scale:$=!1,minFontSize:k=24})=>{const{isDarkMode:w}=s.useContext(J),b=w?"#FFFFFF":"#000000",A=w?"#00FF00":"#FF0000",H=2,f=s.useRef(null),l=s.useRef(null),M=s.useRef([]),i=s.useRef({x:0,y:0}),c=s.useRef({x:0,y:0}),[N,O]=s.useState(k),[T,L]=s.useState(1),[W,S]=s.useState(1),m=v.split(""),Y=(n,r)=>{const o=r.x-n.x,t=r.y-n.y;return Math.sqrt(o*o+t*t)};s.useEffect(()=>{const n=t=>{c.current.x=t.clientX,c.current.y=t.clientY},r=t=>{const e=t.touches[0];c.current.x=e.clientX,c.current.y=e.clientY},o=t=>{const{beta:e,gamma:a}=t;if(e!=null&&a!=null){const d=window.innerWidth,u=window.innerHeight;c.current.x=a/45*(d/2)+d/2,c.current.y=e/45*(u/2)+u/2}};if(window.addEventListener("mousemove",n),window.addEventListener("touchmove",r,{passive:!1}),window.addEventListener("deviceorientation",o),f.current){const{left:t,top:e,width:a,height:d}=f.current.getBoundingClientRect();i.current.x=t+a/2,i.current.y=e+d/2,c.current.x=i.current.x,c.current.y=i.current.y}return()=>{window.removeEventListener("mousemove",n),window.removeEventListener("touchmove",r),window.removeEventListener("deviceorientation",o)}},[]);const g=()=>{if(!f.current||!l.current)return;const{width:n,height:r}=f.current.getBoundingClientRect();let o=n/(m.length/2);o=Math.max(o,k),O(o),L(1),S(1),requestAnimationFrame(()=>{if(!l.current)return;const t=l.current.getBoundingClientRect();if($&&t.height>0){const e=r/t.height;L(e),S(e)}})};return s.useEffect(()=>(g(),window.addEventListener("resize",g),()=>window.removeEventListener("resize",g)),[$,v]),s.useEffect(()=>{let n;const r=()=>{if(i.current.x+=(c.current.x-i.current.x)/15,i.current.y+=(c.current.y-i.current.y)/15,l.current){const t=l.current.getBoundingClientRect().width/2;M.current.forEach(e=>{if(!e)return;const a=e.getBoundingClientRect(),d={x:a.x+a.width/2,y:a.y+a.height/2},u=Y(i.current,d),h=(P,j,z)=>{const V=z-Math.abs(z*P/t);return Math.max(j,V+j)},q=p?Math.floor(h(u,5,200)):100,X=R?Math.floor(h(u,100,900)):400,G=E?h(u,0,1).toFixed(2):0,I=F?h(u,0,1).toFixed(2):1;e.style.opacity=I,e.style.fontVariationSettings=`'wght' ${X}, 'wdth' ${q}, 'ital' ${G}`})}n=requestAnimationFrame(r)};return r(),()=>cancelAnimationFrame(n)},[p,R,E,F,m.length]),x.jsxs("div",{ref:f,className:`relative w-full h-full overflow-hidden transition-colors duration-500 ${w?"bg-zinc-900":"bg-[#faf9f9]"}`,children:[x.jsx("style",{children:`
        @font-face {
          font-family: '${y}';
          src: url('${B}');
          font-style: normal;
        }
        .stroke span {
          position: relative;
          color: ${b};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${H}px;
          -webkit-text-stroke-color: ${A};
        }
      `}),x.jsx("h1",{ref:l,className:`text-pressure-title uppercase text-center ${D?"flex justify-between":""} ${C?"stroke":""}`,style:{fontFamily:y,fontSize:N,lineHeight:W,transform:`scale(1, ${T})`,transformOrigin:"center top",margin:0,fontWeight:100,color:C?void 0:b,transition:"color 0.5s ease, background-color 0.5s ease"},children:m.map((n,r)=>x.jsx("span",{ref:o=>M.current[r]=o,"data-char":n,className:"inline-block",children:n},r))})]})};export{Q as default};
