// ===== シナリオ =====
const bgm = n => AU.playBGM(n);
const se = (n, o) => AU.se(n, o);
const G1 = '構成員';

// ブラックアビス構成員の立ち絵をコードで生成
(function makeGrunts() {
  [['grunt', '#c060ff'], ['grunt_free', '#5ff2ff']].forEach(([k, eye]) => {
    const cv = document.createElement('canvas'); cv.width = 240; cv.height = 440;
    grunt(cv.getContext('2d'), 110, 440, 2.6, { eye });
    GEN[k] = cv.toDataURL();
  });
})();
const showGrunts = (n = 5, o = {}) => { const xs = [180, 400, 640, 880, 1100]; for (let i = 0; i < n; i++) show('g' + i, xs[i], { img: o.free ? 'grunt_free' : 'grunt', h: 470 + (i % 2) * 30, flip: i >= 3 }); };
const hideGrunts = () => { for (let i = 0; i < 5; i++) hide('g' + i); };

async function playMorse(code, U = 0.11) {
  for (const ch of code) {
    if (ch === '・') { se('beep', { dur: U }); await wait(U * 2000); }
    else if (ch === 'ー' || ch === '－') { se('beep', { dur: U * 3 }); await wait(U * 4000); }
    else await wait(U * 2500);
  }
}

// ================= 第1章 =================
async function ch1() {
  await card('第1章', '出会い');
  bg('alley'); bgm('chase');
  show('iroha', 'c', { anim: 'hop' });
  await n('私いろは、今ヤバい奴らに追われているの。');
  await n('どうしよう、私の肩掛け式ギター型鍵盤マシンガンも弾がもうないよ...。');
  await t('いろは', '（カチッ、カチッ）……はい、空っぽ。');
  await n('でも私、頭いいから分かるんだ。');
  await MG.footsteps();
  await n('足音からして追っ手は5人、この路地を抜けた際には地下鉄がある。');
  await n('あそこの通路は入り組んでるから、ピークしてスパイク設置からの出口ラッシュで**クラッチGG**ね。');
  await MG.escape();
  shake(400, 16);
  await n('って、きゃっ。');
  await n('私としたことが、石に躓いて転んでしまった。');
  hide('iroha');
  showGrunts(5);
  await t(G1, 'っへっへえっへ、大人しく捕まるんだな！');
  await t(G1, 'よくも仲間を12人も殺してくれたな！');
  await n('5人に囲まれ、銃を突きつけられる。');
  await n('**キルレ12**か...まあよくやった方ね...。');
  await n('その時だった。');
  await t(G1, 'お...おい、何だあれ...');
  bg('alley', { rainbow: true }); se('warp');
  await t(G1, '光ってやがる...電柱が...虹色に...');
  hideGrunts(); textHide();
  bgm('kaguya');
  await sys('♪ ここで流れる『ワールドイズマイン』', 'gold', { ms: 2600 });
  flash('#fff', 700);
  show('kaguya', 'c', { glow: true, anim: 'hop' });
  await n('そこから出てきたのは...金髪の...え？...幼女？　なんで？');
  show('kaguya', 'c');
  showGrunts(4); show('kaguya', 'c', { z: 5 });
  await n('私を含む6人が戸惑っていると、その子は敵の1人に質問をする。');
  await t('かぐや', 'わたし、いつもとどこが違うでしょう～？');
  await t(G1, 'え？　いや誰だよおまえ');
  se('gun'); flash('#fff', 200); hide('g0');
  await t('かぐや', '##髪型が違うやろがい～！##');
  await n('そう言うとその子はハンドガンで敵を1人殺す。');
  await t('かぐや', 'じゃあ次はあなた、いつもとどこが違うでしょ～？');
  await t(G1, 'ひっ、う、うてぇ～');
  for (let i = 0; i < 4; i++) { se('mgun'); await wait(90); }
  shake(500, 14);
  for (let i = 1; i < 4; i++) { se('gun'); flash('#fff', 150); hide('g' + i); await wait(220); }
  await t('かぐや', '##靴まで見ろやぁー！##');
  await n('そしてその子は5人を殺し、こちらを向く。');
  show('iroha', 'l'); show('kaguya', 'r', { flip: true });
  await t('かぐや', '大丈夫？');
  await t('いろは', '大丈夫だよ、ありがとう。……あなたは？');
  await t('かぐや', 'わたしは、かぐや。');
  await t('かぐや', 'それじゃ、あなたにも聞いちゃお。わたし、いつもとどこが違うでしょ～？');
  await t('いろは', 'え、初対面だよね！？');
  await t('かぐや', 'いいからいいから～。外したら……ね？');
  await MG.spotdiff();
  await t('かぐや', 'やるじゃん、いろはチャン。気に入った！');
  await t('いろは', 'なんで私の名前知ってるの……');
  await t('かぐや', 'ハッカーだから。');
  await n('ハッカーだと何で名前が分かるんだろう。あと、なんで電柱から出てきたんだろう。');
  await n('それが、かぐやとの出会いだった。');
}

// ================= 第2章 =================
async function ch2() {
  await card('第2章', '電脳');
  bg('vrcity'); bgm('cyber');
  await n('2050年、発達したVR技術は、VR空間への**物体の転送**を可能にした。');
  await n("tukimi社が作り出したVR世界『it'a true wolrd』は世界的大ブームを博した。");
  await n('一方、優秀なユーザーの脳データを強奪、販売する**電脳強盗**も社会問題となっていた。');
  await n('電脳強盗集団『**ブラックアビス**』。いま世間を賑わせているお尋ね者だ。');
  await fadeBg('hideout');
  show('iroha', 'l'); show('kaguya', 'r', { img: 'kaguya_real', h: 620 });
  await t('かぐや', 'で、きみが狙われたってわけだよ、いろはチャン');
  await t('いろは', '私はなんでかぐやが電柱から出てきたのかが気になるんだけど...。');
  await t('かぐや', '今それどうでもよくない？');
  await t('いろは', 'あと服、さっきと違わない？');
  await t('かぐや', '部屋着～。アバターなんて着替え放題だよ');
  se('buzzer'); BG.st.cam = true; shake(200, 6);
  await n('その時、かぐやのPCからブザーが鳴り響く。');
  await t('いろは', 'えっ、なになに！？', { nofocus: true });
  await n('ビビる私を無視して、かぐやはパチパチパチとPCを叩き始める。');
  for (let i = 0; i < 8; i++) { se('type'); await wait(60); }
  await n('なにしてんだろ...覗いてみると、中央には監視カメラの映像？　逃げている少女が映し出されている。');
  await n('名前は...**芦花**？');
  await n('その周りにはなにやらコードがたくさん書かれてる、てか現在進行形でかぐやが書いている。');
  await n('真ん中の映像はたぶんVR世界の映像だ。');
  await n('共通テストで情報が今年から**配点400点**となったので、周りのコードもいくらかは読める。');
  await MG.codequiz();
  await n('えっと、これはたぶんVR世界での自分の体力を増やすコード、こっちは攻撃力を増やす、こっちは建物を透かす...これは人の位置を表示...これは任意の電柱に瞬間移動する...');
  await n('...あ、こいつチーターだ。');
  await t('かぐや', 'いま「チーターだ」って思ったでしょ');
  await t('いろは', '思ってない思ってない');
  await t('かぐや', 'ふーん。……行くよ、いろは。あの子もブラックアビスに狙われてる');
  flash('#fff', 600); se('warp');
  show('kaguya', 'r', { img: 'kaguya', h: 600, flip: true });
  await t('かぐや', 'お出かけ用アバター、装着！');
  await n('そして私たちは電柱にワープして、ブラックアビスに追われている芦花さんのもとへ向かった。');
  await MG.polewarp();
  hideAll(); bg('vrcity');
  show('iroha', 'l'); show('kaguya', 'cl'); show('roka', 'r', { flip: true });
  await t('芦花', 'あ、あの……助けてくれるんですか？');
  await t('いろは', 'うん、仲間だよ。私はいろは、こっちはかぐや');
  await t('芦花', '綾紬芦花です。……ところで今、電柱から出てきませんでした？');
  await t('かぐや', '今それどうでもよくない？');
  bgm('chase');
  await n('追ってきているのは10人、その中にはブラックアビス幹部である**雷**と**アキラ**もいる。');
  hideAll();
  show('rai', 'l', { anim: 'hop' }); show('akira', 'r', { flip: true });
  await t('アキラ', '見つけたぜぇ。電柱から湧いて出るネズミがいるってなァ');
  await t('雷', '……全員、確保する。脳は傷つけるな');
  await n('二人の瞳は、濁った紫色に光っていた。');
  hideAll();
  await n('私たちはだんだんと追い詰められ、廃ビルに立てこもるに至った。');
  await fadeBg('ruin');
  show('roka', 'l'); show('kaguya', 'c'); show('iroha', 'r', { flip: true });
  await t('芦花', 'こ、ここで迎え撃つんですか！？　私、ハンドガン一丁しか……');
  await t('かぐや', '撃つのは芦花ちゃん、照準補正はわたし。完璧な分業！');
  await MG.siege();
  await t('いろは', 'ちょっと、チーターでしょ？　どうにかしてよ。');
  await t('かぐや', 'ハッカーってよんで！　ハッカーって、そっちの方がかっこいいから');
  await t('芦花', 'え、かぐやさんチーターなんですか？');
  await t('かぐや', 'だからハッカーって');
  AU.stopBGM(1.5);
  BG.st.holy = true; BG.st.holyT = BG.t;
  await n('その時、窓から眩い光が差し込む。');
  bgm('yachiyo'); se('chime');
  await t('かぐや', '……げっ。', { nofocus: true });
  hide('kaguya');
  await n('そしてどこからか荘厳な音楽も流れてくる。');
  await n('つぼみは開き花となり、水溜りは大海となりメンダコが泳ぎ始める。');
  show('yachiyo', 'c', { glow: true });
  await n('空から舞い降りてきたのは、この世界の創始者、**月見ヤチヨ**であった。');
}

// ================= 第3章 =================
async function ch3() {
  await card('第3章', '真実');
  bg('ruin', { holy: true, holyT: -10 }); bgm('yachiyo');
  show('yachiyo', 'c', { glow: true });
  await n('突然の創始者の登場にブラックアビスは逃げ、そして気づいたらかぐやも逃げていた。');
  await n('（かぐや……？　さっきまでそこにいたのに）');
  show('yachiyo', 'c');
  await t('ヤチヨ', 'みなさん、無事ですか？');
  show('iroha', 'l');
  await t('いろは', 'はい、ありがとうございます。');
  await t('ヤチヨ', 'よかった。今度、貴女方のような、電脳強盗に狙われているユーザーに**緊急脱出コード**を与えようと思うの');
  await n('そういって、ヤチヨさんは日付と場所のデータを私の脳に送ってくれた。');
  await sys('＜受信：集会座標 ／ 2日後 21:00 ／ 月見大社・水上舞台＞');
  await t('ヤチヨ', '2日後、その場所に来てくださる？');
  await t('ヤチヨ', '……特に、いろはちゃん。あなたには、ぜひ来てほしいの');
  hide('yachiyo');
  await n('そう言うと、早々に去るヤチヨ。');
  await n('そして私と芦花さんは二人、廃ビルに取り残された。');
  show('roka', 'r', { flip: true });
  await t('芦花', '……');
  await t('いろは', '……');
  await t('いろは', 'えっと～、カフェでも行きます？');

  await fadeBg('cafe'); bgm('cafe');
  hideAll();
  show('noi', 'c', { anim: 'hop' });
  await n('男の娘メイド猫カフェに入ると、1人のメイドさんが、席を案内してくれた。');
  await t('乃依', 'おかえりなさいませ、お嬢様～！　ご注文はお決まりですかにゃん♡');
  const c = await choice(['萌え萌えオムライス', 'チンチラ見守りパフェ', 'ブラックアビス（ブレンドコーヒー）']);
  if (c === 0) await t('乃依', 'は～い♡　オムライスですね～！');
  if (c === 1) await t('乃依', 'あっ、そちら本日チンチラが出勤しておらず……代わりにオムライスはいかがですかにゃん♡');
  if (c === 2) { await t('乃依', '……ブラックアビス、ですね。', { nofocus: true }); await t('乃依', '……なーんて♡　サービスでオムライスもお付けしますにゃん'); }
  await t('乃依', 'それではご一緒に、おいしくなる魔法をかけましょう～♡');
  await MG.omajinai();
  await t('乃依', '……ところで。お二人さん、**ブラックアビスに狙われていますよね？**');
  await n('と言われ、奥の個室に通してもらえることになった。');
  await fadeBg('caferoom'); hideAll();
  show('roka', 'l'); show('iroha', 'r', { flip: true });
  await t('芦花', 'いろはさん、なんですか？　ここ、男の娘にメイドに猫って、詰め込みすぎじゃないですか？');
  await t('いろは', '分かってないなあ、そこがいいんだよ。');
  await n('そういえばあのメイドさん、どうして私たちが狙われていることを知っていたんだろう。');
  se('door'); shake(500, 18); bgm('chase');
  hideAll(); showGrunts(4); show('noi', 'c', { z: 5 });
  await n('その時、個室の扉が勢いよく開き、武装した集団が入ってくる。');
  await t('乃依', 'ごめんにゃさい、お嬢様。……これも、お仕事なので');
  await n('メイドさんの瞳も、あの濁った紫色だった。');
  await n('私たちは抵抗する暇もなく捕らえられる。');
  await n('あぁ、**キルレ15**か、まあよくやった方か。');
  await n('と思った時だった。');
  se('smoke');
  await n('部屋の中にスモークグレネードが投擲され、すぐに何も見えなくなる。');
  await MG.smoke();
  hideAll(); AU.stopBGM();
  await n('複数の銃声、そしてスモークが開けると、そこには１人？　１匹？　のチンチラが立っていた。');
  show('mami', 'c', { anim: 'hop' });
  await n('ワンウェイスモークでのクラッチ...');
  show('iroha', 'l');
  await t('いろは', '自分フレ申いっすか？');
  await t('真実', '……あとでね。');
  show('roka', 'r', { flip: true });
  await n('彼女の名前は**真実**。');
  bgm('sinister');
  await n('そして真実は真実を語りだした。');
  await t('真実', '長くなるけど、いい？　まず2048年の創業期まで遡ると――');
  await n('長いので要約すると、');
  await n('ブラックアビスは脳のデータを書き換えられて、**洗脳**されている。');
  await n('それを創り出したのは、この世界の創始者、**月見ヤチヨ**である。');
  await n('月見ヤチヨは、全ユーザーの中から優れた知能を持つユーザーの知能を奪い、**完全体**になろうとしている。');
  await n('その計画は2日後、優れたユーザーを、コードの配布という名目で集め、そこで一気に電脳を奪い取るというもの。');
  await t('いろは', 'そんな...でもヤチヨさんはさっき助けてくれたんだよ。');
  await t('真実', 'それは電脳を一気に奪うため。');
  await t('いろは', 'そんな...そんなはずない...！');
  BG.setTint('rgba(80,0,60,.35)');
  await t('ヤチヨ', 'そう、そんなはずないわ');
  await n('この声は...その声のする方を振り返ろうとするも、体が動かない。');
  await sys('＜身体動作制限＞', 'red', { ms: 1400 });
  show('yachiyo', 'c', { z: 0 }); show('mami', 'cr');
  await t('ヤチヨ', '私の世界で内緒話なんて...できるとおもった？');
  await t('いろは', '月見...ヤチヨ...！');
  await t('ヤチヨ', 'ふふふ...貴女方のデータは書き換えて、動けなくさせてもらったわ。');
  await t('ヤチヨ', '芦花ちゃん、真実ちゃん、そして...貴女を食べるのが一番楽しみなのよ...いろはちゃん...');
  textHide(); glitch(900);
  await blackout(true, 1200);
  BG.setTint(null); hideAll();
  await blackout(false, 10);
}

// ================= 第4章 =================
async function ch4() {
  await card('第4章', 'ハッカー');
  bg('prison'); bgm('prison');
  show('roka', 'l'); show('iroha', 'c'); show('mami', 'r', { flip: true });
  await n('私たちは捕まり、VR監獄『**月見刑務所**』に収監された。');
  await n('通常VR世界のユーザーは身体データが安定している時、現実とVR世界を自由に出入りできるはずだが...。');
  await t('真実', 'できない...');
  await sys('＜LOGOUT : DISABLED＞', 'red', { ms: 1400 });
  await t('芦花', 'わ、私たち、どうなっちゃうんですか……');
  await t('真実', '2日後の集会で、脳を食べられる。');
  await t('芦花', '言い方！');
  textHide();
  const s1 = sys('＜・ー　・ー・ー　ー・・・＞', '', { noWait: true });
  await playMorse('・ー ・ー・ー ー・・・');
  await t('いろは', 'な、なに？');
  sysClear();
  await n('脳に何か信号が...。');
  textHide();
  sys('＜ー・ー・・　ーーーー　ー・ーーー　ー・ーー・　・・ーー・・＞', '', { noWait: true });
  await playMorse('ー・ー・・ ーーーー ー・ーーー ー・ーー・ ・・ーー・・');
  await n('あぁ、なんだモールス信号か。');
  sysClear();
  await n('2歳の時に覚えといてよかった。');
  await t('芦花', '2歳で！？');
  await sys('＜いろは　きこえる？　かぐやだよ＞', 'gold');
  await n('月見刑務所のセキュリティの隙を見つけ、**1ビット分の通信路**を確保したらしい。');
  await n('（かぐや……逃げたんじゃなかったんだ）');
  bgm('cyber');
  await n('かぐやが伝えた、私たちを助け、狙われるユーザー全員を救う作戦。');
  await sys('作戦①　月見刑務所の秘密鍵で脱出する', 'gold', { noWait: true });
  await n('私たちはかぐやから受け取った月見刑務所の秘密鍵でここを脱出する。');
  sys('作戦②　ブラックアビス本部で全員の洗脳を解除する', 'gold', { noWait: true });
  await n('ブラックアビスの本部に行き、全員の洗脳を解除する。');
  sys('作戦③　ヤチヨが勝利を確信した瞬間に叩く', 'gold', { noWait: true });
  await n('明日行われる集会、集められたユーザーのデータが一気に書き換えられる瞬間——ヤチヨが勝利を確信した瞬間に、ヤチヨを叩く。');
  sysClear();
  await n('ヤチヨの注目をこちらに集め、その隙にかぐやがヤチヨをハッキングする。');
  await n('ヤチヨからVR世界の退出権限を無くし、他のユーザー全員をログアウトさせる。');
  await n('ヤチヨを、永遠にVR世界に捕らえる。');
  await n('ヤチヨは自らの創り上げた最強のシステムに囚われるのだ。');
  await t('真実', '……それ全部、1ビットで送ってきたの？');
  await t('いろは', 'うん。3時間かかった');
  await t('芦花', '3時間ずっと「ピッ」「ピーッ」って聞いてたんですか……');
  await t('いろは', 'あとは、秘密鍵だけ。……来た');
  await MG.morse();
  BG.st.open = true; se('warp'); flash('#f46', 500);
  await n('秘密鍵を打ち込むと、檻はすぐに消滅した。');
  await n('かぐやはチーターなどではない、**最強のハッカー**だ。');
  await t('芦花', 'でも、檻の外にも看守が……');
  await t('真実', '大丈夫。見つからなければいい');
  bgm('stealth');
  await MG.stealth();

  // --- 追加シーン：屋上の夜 ---
  await fadeBg('rooftop'); bgm('night'); hideAll();
  await n('月見刑務所を抜け出した夜。芦花さんと真実さんは、本部の場所を調べに先に向かった。');
  se('warp'); flash('#fff', 400);
  show('kaguya', 'r', { flip: true, anim: 'hop' });
  await t('かぐや', 'おつかれ～。脱獄、なかなかのタイムだったよ');
  show('iroha', 'l');
  await t('いろは', 'かぐや！　……ありがとう。助けに来てくれて');
  await t('かぐや', 'へへ。ハッカーですから');
  await t('いろは', 'ねえ、なんであの時逃げたの？　ヤチヨさんが来た時');
  await t('かぐや', '……ちょっと、会いたくない人だったから');
  await t('いろは', '知り合い？');
  await t('かぐや', '今それどうでもよくない？');
  await t('いろは', 'それ、便利な言葉だと思ってるでしょ');
  await n('かぐやは笑ってごまかして、月を見上げた。');
  await t('かぐや', 'ねえ、いろは。全部終わったら、何したい？');
  await choice(['パン屋さん', 'パン屋さん', 'パン屋さん！']);
  await t('いろは', 'パン屋さん。朝早く起きて、パン焼いて、焼きたての匂いの中で、のんびり暮らすの');
  await t('かぐや', 'いいじゃん。じゃあ、わたしも一緒にやる');
  await t('いろは', 'ほんと！？　お店の名前どうしよう');
  await t('かぐや', '「ベーカリー電柱」');
  await t('いろは', '却下');
  await t('いろは', 'あと、子供は三人がいいな');
  await t('かぐや', '急に話飛んだ！？');
  await t('いろは', 'え、お店の跡継ぎの話だけど');
  await t('かぐや', '気が早すぎ～！');
  await n('二人でお腹を抱えて笑った。こんなに笑ったの、いつぶりだろう。');
  await t('かぐや', '……ふふ。うん、**約束**');
  await n('かぐやはそう言って、少しだけ寂しそうに笑った。');
  await n('秘密鍵が「やくそく」だった理由を、私はまだ知らなかった。');
}

// ================= 第5章 =================
async function ch5() {
  await card('第5章', '洗脳');
  bg('hq'); AU.stopBGM();
  await n('私は、バカでかいラジカセを持って、ブラックアビスの本部にいた。');
  show('iroha', 'c');
  await n('洗脳を解く方法...脳データの該当部分を**特殊音波**によって震わせ、正常に戻す。');
  await n('音波と言っても、それは、**歌**だ！');
  se('door'); shake(500, 18); hide('iroha');
  bgm('sinister');
  await n('本部のドアをぶち破ると、数十人のメンバーがこちらを向く。');
  show('rai', 'l'); show('noi', 'c'); show('akira', 'r', { flip: true });
  await t('アキラ', 'あぁ？　脱獄囚がノコノコと……');
  await t('雷', '……排除する。');
  await t('乃依', 'あっ、さっきのお嬢様……');
  await n('そういえば最初にかぐやと会った時も曲をかけていて、相手の動きが鈍くなっていたなあと思い出す。');
  hideAll();
  show('roka', 'l'); show('iroha', 'c'); show('mami', 'r', { flip: true });
  await t('いろは', '芦花さん、真実さん、準備はいい？');
  await t('芦花', '歌は、得意です！');
  await t('真実', '……踊りは、たぶん得意。');
  await t('いろは', '私はリズム担当。マシンガンで！');
  await n('ラジカセのボタンを押すと、曲が流れ始める。');
  await MG.rhythm();
  bg('hq', { live: true, bob: 10 }); bgm('hack');
  hideAll();
  await n('『恋愛裁判』が終わり、『ロキ』のイントロが流れ始めたころ、ブラックアビスのメンバーのほとんどは洗脳が解けていた。');
  show('iroha', 'c', { anim: 'hop' });
  await t('いろは', 'よーし、仕上げいくよー！');
  await MG.callres();
  show('iroha', 'c');
  se('phone');
  await n('コール＆レスポンスをしていると、かぐやから電話がかかってきた。');
  await t('かぐや', 'そっちは作戦通り行ってる？', { nofocus: true });
  await t('いろは', 'うん、完璧な作戦のおかげでね。');
  await t('かぐや', 'え？　なに？　ぜんぜん聞こえないんだけど', { nofocus: true });
  await t('いろは', 'だから、作戦通り行ってるよ。');
  se('cheer');
  await t('構成員たち', 'ブラック～！？　**アビス！　アビス！**');
  await t('かぐや', 'え？　聞こえな...アビス？　なにしてるの？', { nofocus: true });
  AU.stopBGM(); bg('hq');
  hideAll();
  show('rai', 'l'); show('akira', 'r', { flip: true });
  await t('アキラ', '……頭が、スッキリしやがった。俺、何してたんだ');
  await t('雷', '記憶はある。……俺たちは、ヤチヨに使われていた');
  show('noi', 'c', { anim: 'hop' });
  await t('乃依', 'お嬢様……カフェでは、本当にごめんなさい……！');
  await t('雷', '乃依……！　無事で、よかった');
  await n('雷さんと乃依ちゃんは兄妹……いや、兄弟らしい。');
  bgm('night');
  show('iroha', 'cl', { z: 3 });
  await t('いろは', '明日、ヤチヨの集会がある。……力を貸して');
  await t('アキラ', 'はっ、決まってんだろ。借りは倍にして返す');
  await t('雷', '俺とアキラは、ヤチヨの警護役に配置されている。……背後は任せろ');
}

// ================= 第6章 =================
async function ch6() {
  await card('第6章', '決戦');
  bg('plaza', { crowd: true }); bgm('yachiyo');
  await n('翌日、指定された座標にはすでに多くの人が集まっていた。');
  show('yachiyo', 'c', { glow: true });
  await n('そして、月見ヤチヨが壇上に上がる。');
  show('yachiyo', 'c');
  await t('ヤチヨ', 'みなさま、ようこそお集まりいただきました。');
  await n('ヤチヨが手を振り上げる。');
  AU.stopBGM(0.2); BG.st.alarm = true; shake(600, 10);
  await n('集まる人々に一斉に付与されたのは――');
  await sys('＜ログアウト不可　身体動作制限＞', 'red');
  bgm('sinister');
  await t('ヤチヨ', 'みなさんの知能は、私がいただきます。');
  await n('真実さんの言った通りだった。');
  await n('ヤチヨの思惑と違うのは...その背後。');
  show('rai', 'll'); show('akira', 'rr', { flip: true });
  await n('自分の警護役に配置されたブラックアビスの雷とアキラ、その洗脳はもう、**解けている**。');
  bgm('battle'); shake(500, 16); se('explode');
  await n('ブラックアビスのメンバーが一斉にヤチヨに襲い掛かる。');
  anim('yachiyo', 'hop');
  await n('ヤチヨは身のこなしでその攻撃をすべてよける。');
  hide('rai'); hide('akira');
  await t('ヤチヨ', 'なにしてんの...おまえら？');
  show('iroha', 'l', { anim: 'hop' });
  await t('いろは', 'もう洗脳は解いたよ。');
  await n('私の声に驚き、こちらを向くヤチヨ。');
  await t('ヤチヨ', '私のデザート...どうしてここに');
  await t('いろは', 'デザートになる気はないよ。――あなたの相手は、私！');
  await MG.danmaku();
  BG.st.alarm = false; hideAll();
  show('yachiyo', 'c');
  await n('その動揺が、自身のセキュリティを緩くする。');
  se('warp'); flash('#fff', 600);
  show('kaguya', 'r', { flip: true, glow: true });
  await t('かぐや', 'らしくないよ...**ママ**。');
  show('kaguya', 'r', { flip: true }); show('iroha', 'l');
  await t('いろは', 'ママ！？', { nofocus: true });
  await n('電柱から登場するかぐや。');
  await MG.typing();
  bgm('hack');
  await sys("＜権限を'月見かぐや'に移動　'月見ヤチヨ'にログアウト不可　身体動作制限を付与＞", 'gold');
  await t('かぐや', '隙だらけじゃん。');
  await t('ヤチヨ', 'このクソチーターがぁ！');
  await t('かぐや', '失礼だな、**ハッカー**だよ。');
  await sys('＜全ユーザーの強制ログアウト開始＞', 'gold');
  bgm('sad');
  await t('かぐや', 'ママ、もうこの世界は終わりだよ');
  await t('ヤチヨ', 'かぐや！　今すぐ止めなさい！');
  await n('ヤチヨが叫ぶと、かぐやはヤチヨに＜発言不可＞を付与する。');
  await sys('＜発言不可＞', 'red', { ms: 1200 });
  show('yachiyo', 'c', { ghost: true });
  await t('かぐや', 'いろは、本当にありがとう');
  await t('いろは', 'ううん、かぐやのおかげだよ。');
  show('iroha', 'l', { ghost: true });
  await n('私の体は、ログアウトが進むにつれ、だんだんと透けていく。');
  show('roka', 'll', { ghost: true }); show('mami', 'cl', { ghost: true });
  await n('芦花さんも、真実さんも。');
  hide('yachiyo');
  await t('かぐや', 'でも、ごめんいろは、私いっしょには行けない');
  await t('いろは', 'え、かぐや...？');
  await t('いろは', 'どうして...？');
  await t('かぐや', 'ママには、現実からでは干渉できないの、誰かがここで止めていないといけない');
  await t('いろは', 'そんな、じゃあかぐやは最初からそのつもりで...！');
  await t('かぐや', '……秘密鍵、覚えてる？');
  await t('いろは', '……「やくそく」');
  await t('かぐや', 'うん。約束は、ちゃんと守るから');
  await t('いろは', 'ねえ、最後に教えて。なんで、電柱から出てくるの');
  await t('かぐや', '……かっこいいから。');
  hide('roka', { fade: true }); hide('mami', { fade: true });
  await t('いろは', 'いやだよ、一緒にパン屋やるって約束したじゃん！');
  await t('いろは', '子供は三人がいいって、かぐや！');
  await t('かぐや', '……気が、早すぎだよ', { nofocus: true });
  hide('iroha', { fade: true });
  await t('いろは', 'まって！');
  textHide();
  await fadeBg('logout', {}, 1500, '#fff');
  hideAll();
  await wait(1200);
  await sys("＜ログアウトが完了しました。it'a true wolrd はいつでもここにあります。＞", 'gold');
  AU.stopBGM(3);
  await blackout(true, 2000);
  await blackout(false, 10);
}

// ================= 終章 =================
async function ch7() {
  await card('終章', '月見かぐや');
  bg('realcity'); bgm('ending');
  await n('VR世界の大規模不正アクセス事件。');
  await n('第二の世界は一夜にして消え、誰もログインできなくなった。');
  await n('創始者で容疑者である月見ヤチヨは行方不明、その娘である月見かぐやも。');
  await n('VR世界はこの事件をきっかけに危険視、世界の在り方を変えうる**禁忌**となった。');
  await n('あれから2年。');
  await n('芦花さんは、路上ライブから本当に歌手デビューした。真実さんは……現実でも、なぜかチンチラっぽい。');
  await n('ブラックアビスのみんなは、今はボランティアで電脳犯罪の被害者支援をしているらしい。');
  await n('私は、駅前のパン屋さんで修行中。毎朝4時起き。');
  await n('月見ヤチヨとかぐやは、今もVR世界にいるのだろうか。');
  await n('サーバールームはとっくに取り壊され、Tukimi社のあったところには、別の建物が建っている。');
  await n('もう消えてしまっているだろうか。');
  await n('私はふと思いついて、スマホで検索をしてみる。');
  textHide();
  await MG.phone();
  await n('……Wikipediaの、ノートのページ。');
  await n('2年ぶりの「かぐや」の文字が、スマホの画面の中で、ちかちか光っていた。');
  await t('いろは', '……ばか。2年も待たせて');
  await n('涙で画面がにじむ。でも、口元はたぶん、笑ってた。');
  await t('いろは', '……物件なら、駅前の角のとこ。もう押さえてあるよ');
  se('warp');
  await n('窓の外で、電柱が一本、虹色に光った気がした。');
  await n('かぐやはチーターなんかじゃない。');
  await n('約束を守る、**最強のハッカー**だ。');
  textHide();
  const sv = save.load(); sv.cleared = true; save.write(sv);
  await card('THE END', 'ハッカーってよんで！');
  await endScreen();
}

async function endScreen() {
  bg('title'); bgm('title');
  const el = $('#title'); el.classList.remove('hidden');
  el.innerHTML = `<div class="logo">ありがとう<small>THANK YOU FOR PLAYING</small></div>
    <div class="menu"><button id="wiki">月見かぐや - Wikipedia を開く</button><button id="back">タイトルへ</button></div>
    <div class="credit">原作ストーリー：あなた ／ キャラクター画像：手持ち素材 ／ 背景・BGM・効果音：コード生成</div>`;
  el.querySelector('#wiki').onclick = () => window.open('https://sites.google.com/view/tukimikaguya', '_blank');
  await new Promise(r => el.querySelector('#back').onclick = r);
  location.reload();
}

// ================= タイトル / 進行 =================
const CHAPTERS = [['第1章', '出会い', ch1], ['第2章', '電脳', ch2], ['第3章', '真実', ch3], ['第4章', 'ハッカー', ch4], ['第5章', '洗脳', ch5], ['第6章', '決戦', ch6], ['終章', '月見かぐや', ch7]];

function titleScreen() {
  return new Promise(res => {
    hideAll(); textHide();
    bg('title'); bgm('title');
    const sv = save.load();
    const el = $('#title'); el.classList.remove('hidden');
    el.innerHTML = `<img src="img/kaguya.png" style="position:absolute;left:90px;bottom:-30px;height:700px;filter:drop-shadow(0 0 30px #f4a8)">
      <div class="logo">ハッカーって<br>よんで！<small>── it'a true wolrd ──</small></div>
      <div class="menu">
        <button data-a="new">はじめから</button>
        <button data-a="cont" ${sv.reached > 0 ? '' : 'disabled'}>つづきから${sv.reached > 0 ? `（${CHAPTERS[sv.reached][0]}）` : ''}</button>
        <button data-a="sel" ${sv.reached > 0 || sv.cleared ? '' : 'disabled'}>章をえらぶ</button>
      </div>
      <div class="credit">Space / Enter / クリック：進む　Ctrl：スキップ　ホイール上：ログ</div>`;
    el.onclick = e => {
      const b = e.target.closest('button'); if (!b) return; AU.se('select');
      const a = b.dataset.a;
      if (a === 'new') { el.classList.add('hidden'); res(0); }
      if (a === 'cont') { el.classList.add('hidden'); res(sv.reached); }
      if (a === 'sel') {
        const max = sv.cleared ? CHAPTERS.length - 1 : sv.reached;
        el.querySelector('.menu').innerHTML = `<div class="chsel">${CHAPTERS.map((c, i) => `<button data-ch="${i}" ${i > max ? 'disabled' : ''}>${c[0]}　${i > max ? '？？？' : c[1]}</button>`).join('')}</div><button data-a="back">もどる</button>`;
      }
      if (b.dataset.ch !== undefined) { el.classList.add('hidden'); res(+b.dataset.ch); }
      if (a === 'back') { el.classList.add('hidden'); res(titleScreen()); }
    };
  });
}

async function runFrom(i) {
  for (; i < CHAPTERS.length; i++) {
    const sv = save.load(); if (i > sv.reached) { sv.reached = i; save.write(sv); }
    await CHAPTERS[i][2]();
  }
}

// ================= 起動 =================
(async function boot() {
  await preload();
  $('#bootmsg').textContent = 'READY';
  const btn = $('#bootbtn'); btn.classList.remove('hidden');
  await new Promise(r => btn.onclick = r);
  AU.init(); AU.se('chime');
  $('#boot').classList.add('gone');
  const params = new URLSearchParams(location.search);
  if (params.has('mg')) { await MG[params.get('mg')](); }
  const start = params.has('ch') ? +params.get('ch') : await titleScreen();
  await runFrom(start);
})();
