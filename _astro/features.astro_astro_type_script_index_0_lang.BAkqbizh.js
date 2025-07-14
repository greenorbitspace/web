const y=[];function E(){x(),w(),C(),g()}function g(){document.querySelectorAll(".feature-card.perspective").forEach(i=>{const l=i.querySelector(".preserve-3d");if(l){const s=()=>{window.matchMedia("(hover: none)").matches&&l.classList.toggle("rotate-y-180")};l.addEventListener("click",s),y.push(()=>{l&&l.removeEventListener("click",s)})}})}function x(){const e=document.querySelector(".parallax-demo");if(e){const i=e.querySelectorAll(".parallax-layer"),l=o=>{const a=e.getBoundingClientRect(),d=o.clientX-a.left,u=o.clientY-a.top,v=d/a.width-.5,p=u/a.height-.5;i.forEach((t,r)=>{const h=r*10,m=v*h,f=p*h;t.style.transform=`translate3d(${m}px, ${f}px, 0)`})},s=o=>{if(o.touches.length>0){const a=e.getBoundingClientRect(),d=o.touches[0],u=d.clientX-a.left,v=d.clientY-a.top,p=u/a.width-.5,t=v/a.height-.5;i.forEach((r,h)=>{const m=h*10,f=p*m,L=t*m;r.style.transform=`translate3d(${f}px, ${L}px, 0)`})}},n=()=>{i.forEach(o=>{o.style.transform="translate3d(0, 0, 0)"})},c=()=>{i.forEach(o=>{o.style.transform="translate3d(0, 0, 0)"})};e.addEventListener("mousemove",l),e.addEventListener("touchmove",s),e.addEventListener("mouseleave",n),e.addEventListener("touchend",c),y.push(()=>{e&&(e.removeEventListener("mousemove",l),e.removeEventListener("touchmove",s),e.removeEventListener("mouseleave",n),e.removeEventListener("touchend",c))})}}function w(){const e=document.querySelector(".particles-container"),i=document.querySelector(".particles");if(e&&i){(()=>{i.innerHTML="";const c=e.getBoundingClientRect(),o=window.innerWidth<768?15:30;for(let a=0;a<o;a++){const d=document.createElement("div");d.classList.add("particle");const u=Math.random()*6+2,v=Math.random()*c.width,p=Math.random()*c.height,t=Math.random()*2+1,r=Math.random()*.5;d.style.cssText=`
            position: absolute;
            width: ${u}px;
            height: ${u}px;
            background-color: var(--tw-color-primary-400, #a78bfa);
            border-radius: 50%;
            left: ${v}px;
            top: ${p}px;
            opacity: 0;
            animation: float ${t}s ease-in-out ${r}s infinite alternate;
          `,i.appendChild(d)}})();const s=()=>{e.classList.add("active"),setTimeout(()=>{e.classList.remove("active")},1e3)};e.addEventListener("touchstart",s);const n=document.createElement("style");n.textContent=`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0;
          }
        }
        
        .particles-container.active .particles {
          opacity: 1;
        }
      `,document.head.appendChild(n),y.push(()=>{n&&document.head.contains(n)&&document.head.removeChild(n),e&&e.removeEventListener("touchstart",s)})}}function C(){const e=document.getElementById("demo-canvas"),i=document.getElementById("demo-button");if(e&&i){let l=function(){if(n){if(s){s.clearRect(0,0,e.width,e.height);for(let t=0;t<c.length;t++)c[t].update(),c[t].draw(),(c[t].life<=0||c[t].size<=.2)&&(c.splice(t,1),t--)}o=requestAnimationFrame(l)}};const s=e.getContext("2d");let n=!1,c=[],o=null;const a=()=>{const t=e.parentElement;t&&(e.width=t.offsetWidth,e.height=t.offsetHeight)};a(),window.addEventListener("resize",a);class d{x;y;size;color;speedX;speedY;life;constructor(r,h,m){this.x=r,this.y=h,this.size=Math.random()*5+2,this.color=m||`hsl(${Math.random()*60+240}, 70%, 60%)`,this.speedX=Math.random()*3-1.5,this.speedY=Math.random()*3-1.5,this.life=100}update(){this.x+=this.speedX,this.y+=this.speedY,this.life-=1,this.size>.2&&(this.size-=.1)}draw(){s&&(s.fillStyle=this.color,s.beginPath(),s.arc(this.x,this.y,this.size,0,Math.PI*2),s.fill())}}const u=()=>{n=!n,e.style.opacity=n?"1":"0.5",e.style.pointerEvents=n?"auto":"none",i.textContent=n?"Deactivate Demo":"Activate Demo",n?l():o&&(cancelAnimationFrame(o),o=null)},v=t=>{if(!n)return;const r=e.getBoundingClientRect(),h=t.clientX-r.left,m=t.clientY-r.top;for(let f=0;f<3;f++)c.push(new d(h,m))},p=t=>{if(!n)return;const r=e.getBoundingClientRect(),h=t.clientX-r.left,m=t.clientY-r.top;for(let f=0;f<20;f++)c.push(new d(h,m,`hsl(${Math.random()*60+40}, 100%, 60%)`))};i.addEventListener("click",u),e.addEventListener("mousemove",v),e.addEventListener("click",p),y.push(()=>{o&&cancelAnimationFrame(o),window.removeEventListener("resize",a),i&&i.removeEventListener("click",u),e&&(e.removeEventListener("mousemove",v),e.removeEventListener("click",p)),c=[]})}}document.addEventListener("DOMContentLoaded",E);document.addEventListener("astro:page-load",E);document.addEventListener("astro:before-swap",()=>{y.forEach(e=>e()),y.length=0});window.addEventListener("unload",()=>{y.forEach(e=>e())});
