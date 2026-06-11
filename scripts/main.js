/* ===================================
   MLN111 – Main JavaScript
   Nhóm 6 | ĐH FPT HCM
   =================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ── 1. SCROLL PROGRESS BAR ────────── */
  const progressBar = document.getElementById("progress-bar");
  window.addEventListener(
    "scroll",
    () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = (scrolled / total) * 100;
      progressBar.style.width = pct + "%";
    },
    { passive: true },
  );

  /* ── 2. NAVBAR – active link + glass ── */
  const navbar = document.getElementById("navbar");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const updateNavbar = () => {
    // Glassmorphism on scroll
    if (window.scrollY > 60) {
      navbar.style.background = "rgba(8,8,16,0.97)";
    } else {
      navbar.style.background = "rgba(8,8,16,0.85)";
    }

    // Active link based on section in view
    let current = "";
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute("id");
      }
    });
    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  };

  window.addEventListener("scroll", updateNavbar, { passive: true });
  updateNavbar();

  /* ── 3. REVEAL ON SCROLL (Intersection Observer) ── */
  const revealEls = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right",
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ── 4. COUNTER ANIMATION ─────────── */
  const counters = document.querySelectorAll(".stat-number[data-target]");

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-target"));
    const duration = 1200;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, 16);
  };

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((el) => counterObserver.observe(el));

  /* ── 5. PARTICLE CANVAS (Hero) ────── */
  const canvas = document.getElementById("particles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        // mix of red and gold particles
        const isGold = Math.random() < 0.25;
        this.color = isGold
          ? `rgba(243,156,18,${Math.random() * 0.5 + 0.1})`
          : `rgba(192,57,43,${Math.random() * 0.5 + 0.1})`;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (
          this.x < 0 ||
          this.x > canvas.width ||
          this.y < 0 ||
          this.y > canvas.height
        )
          this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    // Create 110 particles
    for (let i = 0; i < 110; i++) particles.push(new Particle());

    // Draw connecting lines between nearby particles
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(192,57,43,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawLines();
      animFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Pause when hero not in view (perf)
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) {
            cancelAnimationFrame(animFrameId);
          } else {
            animate();
          }
        });
      },
      { threshold: 0 },
    );
    heroObserver.observe(document.getElementById("hero"));
  }

  /* ── 6. VIDEO-CENTERED PRESENTATION PLAYER ─── */
  const video = document.getElementById("scenario-video");
  const overlay = document.getElementById("video-overlay");
  const playBtn = document.getElementById("play-btn");
  const playPauseBtn = document.getElementById("iv-play-pause");
  const progressWrap = document.querySelector(".iv-progress-wrap");
  const progressBarEl = document.getElementById("iv-progress-bar");
  const timeDisplay = document.getElementById("iv-time");

  /*
    VIDEO MASTER TIMELINE - bản đang dùng:
    00:00–00:06  đoạn mở/intro visual đầu video
    00:06–00:41  intro Cường: khủng hoảng + hào quang
    00:41        dừng phân tích Tiết 52: cá nhân - xã hội
    00:45–00:50  decision-1-wait
    00:50–01:05  choice-1-control
    01:05–01:20  choice-1-team
    01:30–01:35  decision-2-wait
    01:35–01:50  choice-2-hide
    01:50–02:05  choice-2-open
    02:15–02:20  decision-3-wait
    02:20–02:35  choice-3-blame
    02:35–02:50  choice-3-trust
    02:50–03:15  ending-bad
    03:15–03:40  ending-good
    03:40–04:05  ending-mixed
  */
  const MASTER_DURATION = 245;

  const TIMES = {
    introVideoStart: 6,
    t52IndividualStop: 41,
    decision1WaitStart: 42,
    decision1WaitEnd: 46,
    choice1ControlStart: 46,
    choice1ControlEnd: 62,
    choice1TeamStart: 63,
    choice1TeamEnd: 77,
    t52IndividualStop2: 77,
    t52IndividualStop2a: 78,
    decision2WaitStart: 89,
    decision2WaitEnd: 90,
    choice2HideStart: 91,
    choice2HideEnd: 106,
    choice2OpenStart: 110,
    choice2OpenEnd: 122,
    t52IndividualStop3: 123,
    decision3WaitStart: 135,
    decision3WaitEnd: 137,
    choice3BlameStart: 138,
    choice3BlameEnd: 150,
    choice3TrustStart: 151,
    choice3TrustEnd: 167,
    endingBadStart: 168,
    endingBadEnd: 193,
    endingGoodStart: 195,
    endingGoodEnd: 220,
    endingMixedStart: 220,
    endingMixedEnd: 250,
  };

  const ENDING_EPSILON = 0.18;

  let trust = 50;
  let morale = 50;
  let burnout = 20;
  let power = 50;

  let currentDecision = null;
  let activeChoice = null;
  let activeEnding = null;
  let completedEnding = false;
  let presentationActive = false;
  let shownPresentationStops = new Set();
  let choiceHistory = [];
  let hasTriggeredThisDecision = [false, false, false];

  const INTRO_BRIEFING = {
    id: "intro-briefing",
    tag: "Mở đầu · Cách xem sản phẩm",
    title: "Video tương tác: dùng câu chuyện Cường để học quan hệ và xã hội",
    points: [
      "Video đặt người xem vào vai Cường – một leader sinh viên đang đứng giữa hào quang cá nhân và trách nhiệm với tập thể.",
      "Ở mỗi điểm quyết định, lớp sẽ bấm phím 1 hoặc 2 để chọn cách Cường hành động.",
      "Mỗi lựa chọn làm thay đổi 4 chỉ số: Tín nhiệm, Tinh thần, Áp lực và Đoàn kết.",
      "Sau từng đoạn, nhóm sẽ dừng video để phân tích: cá nhân – xã hội, lợi ích, quần chúng nhân dân, lãnh tụ và quan hệ giữa hai bên.",
      "Cuối cùng, nhóm liên hệ sang làm thế nào để xây dựng con người sinh viên hiện nay.",
    ],
    script:
      "Trước khi bắt đầu, nhóm em xin giới thiệu cách xem sản phẩm. Đây không chỉ là một video minh họa, mà là một case study tương tác. Cả lớp sẽ cùng đứng vào vị trí của Cường để ra quyết định. Mỗi lựa chọn sẽ dẫn đến hệ quả khác nhau, từ đó nhóm em phân tích các nội dung trong Tiết 52 về cá nhân, xã hội, quần chúng nhân dân và lãnh tụ. Sau ending, nhóm em sẽ liên hệ sang Tiết 53 về xây dựng con người trong thực tiễn Việt Nam hiện nay.",
  };

  const STOP_T52_INDIVIDUAL = {
    id: "t52-ca-nhan-xa-hoi",
    time: TIMES.t52IndividualStop,
    tag: "Cá nhân và xã hội",
    title: "Cường là một cá nhân, nhưng không tồn tại tách rời xã hội",
    points: [
      "Cá nhân là con người cụ thể, có cái riêng về kinh nghiệm, tâm lý, trí tuệ, năng lực và điều kiện sống.",
      "Xã hội do các cá nhân cụ thể hợp thành; mỗi cá nhân sống và hoạt động trong xã hội đó.",
      "Quan hệ cá nhân – xã hội là quan hệ biện chứng, trong đó xã hội giữ vai trò quyết định.",
      "Sự tồn tại của cá nhân không thể tách rời xã hội.",
      "Qua các quan hệ xã hội, sức mạnh cá nhân mới được phát huy.",
    ],
    script:
      "Ở đoạn đầu, nhóm em giới thiệu Cường như một cá nhân cụ thể: có năng lực, danh tiếng và sức ảnh hưởng. Nhưng theo nội dung Tiết 52, cá nhân không tồn tại tách rời xã hội. Cường trở thành leader không chỉ vì bản thân cậu giỏi, mà còn vì có CLB, có team, có chiến dịch và có sự công nhận từ tập thể. Vì vậy, nếu Cường tách mình khỏi tập thể, chính nền tảng làm nên vai trò của Cường cũng bị phá vỡ.",
  };

  const STOP_T52_INDIVIDUAL_2 = {
    id: "t52-ca-nhan-xa-hoi-2",
    time: TIMES.t52IndividualStop2,
    tag: "Quan hệ cá nhân – xã hội",
    title:
      "Năng lực cá nhân chỉ có ý nghĩa khi được đặt trong quan hệ với tập thể",
    points: [
      "Xã hội tạo điều kiện cho cá nhân hình thành và phát triển.",
      "Cá nhân không thụ động; cá nhân cũng có thể tác động trở lại xã hội thông qua hành động của mình.",
      "Nhân cách cá nhân phát triển sẽ góp phần vào sự phát triển của xã hội.",
      "Trong case này, Cường có thể thúc đẩy hoặc làm suy yếu tập thể tùy theo cách cậu sử dụng vai trò leader.",
    ],
    script:
      "Sau quyết định đầu tiên, nhóm em muốn dừng lại để nhấn mạnh mối quan hệ hai chiều giữa cá nhân và xã hội. Xã hội, ở đây là CLB và chiến dịch, tạo điều kiện để Cường phát triển vai trò leader. Nhưng Cường cũng tác động ngược lại tập thể: nếu biết lắng nghe thì thúc đẩy tinh thần chung, còn nếu độc đoán thì làm tập thể rạn nứt. Vì vậy, năng lực cá nhân không xấu; vấn đề là cá nhân đặt năng lực đó vào quan hệ nào với tập thể.",
  };

  const POST_CHOICE_ANALYSIS = {
    1: {
      id: "t52-chu-nghia-ca-nhan",
      time: TIMES.t52IndividualStop2a,
      tag: "Chủ nghĩa cá nhân",
      title: "Chủ nghĩa cá nhân: khi Cường tuyệt đối hóa vai trò của mình",
      points: [
        "Tiết 52 yêu cầu tránh khuynh hướng tuyệt đối hóa lợi ích cá nhân và phủ nhận lợi ích tập thể.",
        "Nếu Cường tự quyết mọi việc, team dần mất tiếng nói và chỉ còn làm theo lệnh.",
        "Đây là biểu hiện của chủ nghĩa cá nhân trong môi trường nhóm.",
        "Ngược lại, nếu Cường lắng nghe, cá nhân không bị phủ nhận mà được đặt vào đúng quan hệ với tập thể.",
        "Leader tốt không phải người thay tập thể quyết định mọi thứ, mà là người tổ chức để tập thể cùng hành động.",
      ],
      script:
        "Ở quyết định đầu tiên, nếu Cường tự mình chốt toàn bộ kế hoạch, cậu rơi vào khuynh hướng mà yêu cầu tránh: tuyệt đối hóa vai trò cá nhân và phủ nhận lợi ích tập thể. Khi đó, team không còn là chủ thể cùng xây dựng chiến dịch mà chỉ trở thành người nhận lệnh. Ngược lại, nếu Cường biết lắng nghe, vai trò cá nhân của Cường không mất đi, mà được đặt đúng vào quan hệ với tập thể.",
      nextDecisionIndex: 1,
    },
    2: {
      id: "t52-loi-ich-ca-nhan-tap-the",
      time: TIMES.t52IndividualStop3,
      tag: "Lợi ích cá nhân và lợi ích tập thể",
      title: "Lợi ích là nền tảng của quan hệ cá nhân – xã hội",
      points: [
        "Lợi ích là nền tảng của mối quan hệ giữa cá nhân và xã hội.",
        "Nếu Cường giấu vấn đề ngân sách, cậu đang bảo vệ hình ảnh cá nhân nhưng làm tổn hại lợi ích chung.",
        "Nếu Cường minh bạch, khó khăn trở thành vấn đề chung để tập thể cùng giải quyết.",
        "Cần tránh cả hai cực đoan: đặt cái tôi lên trên tập thể hoặc nhân danh tập thể để thủ tiêu động lực cá nhân.",
        "Quan hệ đúng là thống nhất lợi ích cá nhân chính đáng với lợi ích chung.",
      ],
      script:
        "Ở quyết định thứ hai, vấn đề không chỉ là thiếu ngân sách mà là quan hệ lợi ích. Nếu Cường giấu vấn đề, cậu giữ được hình ảnh cá nhân trong ngắn hạn, nhưng làm mất niềm tin và gây hại cho cả chiến dịch. Nếu Cường minh bạch, khó khăn trở thành vấn đề chung, tạo cơ hội để tập thể cùng tham gia giải quyết. Đây là ý của Tiết 52: lợi ích cá nhân và lợi ích tập thể cần được đặt trong quan hệ thống nhất, không đối lập tuyệt đối.",
      nextDecisionIndex: 2,
    },
  };

  const STOP_T52_AFTER_ENDING = {
    id: "t52-quan-chung-lanh-tu-after-ending",
    tag: "Quần chúng nhân dân và lãnh tụ",
    title: "Từ ending: phân tích đầy đủ quần chúng nhân dân và lãnh tụ",
    points: [
      "Quần chúng nhân dân là bộ phận có lợi ích căn bản chung, liên kết thành tập thể để giải quyết những vấn đề lịch sử đặt ra.",
      "Vĩ nhân/lãnh tụ là cá nhân kiệt xuất, xuất hiện từ phong trào quần chúng và gắn bó với quần chúng.",
      "Quần chúng nhân dân là chủ thể sáng tạo chân chính ra lịch sử và là lực lượng quyết định sự phát triển lịch sử.",
      "Lãnh tụ có vai trò định hướng, tổ chức, tập hợp và thống nhất hành động của quần chúng.",
      "Quan hệ giữa quần chúng và lãnh tụ là quan hệ biện chứng: quần chúng quyết định, lãnh tụ dẫn dắt; hai bên phải thống nhất về mục đích và lợi ích.",
    ],
    cards: [
      {
        icon: "👥",
        title: "Khái niệm quần chúng nhân dân",
        text: "Là lực lượng đông đảo có lợi ích căn bản chung, được liên kết thành tập thể dưới sự lãnh đạo của cá nhân, tổ chức hoặc đảng phái để giải quyết nhiệm vụ kinh tế, chính trị, xã hội của thời đại.",
      },
      {
        icon: "🌟",
        title: "Khái niệm vĩ nhân / lãnh tụ",
        text: "Là cá nhân kiệt xuất do phong trào quần chúng tạo nên, có tri thức, năng lực tập hợp, thống nhất ý chí và hành động, gắn bó với lợi ích của quần chúng.",
      },
      {
        icon: "⚙️",
        title: "Vai trò của quần chúng",
        text: "Quần chúng là lực lượng sản xuất cơ bản, sáng tạo giá trị vật chất và tinh thần, là động lực của các cuộc cách mạng và là lực lượng quyết định sự phát triển lịch sử.",
      },
      {
        icon: "🧭",
        title: "Vai trò của lãnh tụ",
        text: "Lãnh tụ có thể thúc đẩy phong trào khi hành động phù hợp quy luật khách quan và lợi ích quần chúng; ngược lại có thể kìm hãm phong trào nếu độc đoán, xa rời tập thể.",
      },
      {
        icon: "🔁",
        title: "Quan hệ biện chứng",
        text: "Quần chúng giữ vai trò quyết định, lãnh tụ giữ vai trò dẫn dắt. Lãnh tụ xuất hiện từ phong trào quần chúng, còn quần chúng cần sự định hướng để sức mạnh được tổ chức thành hành động.",
      },
      {
        icon: "🎬",
        title: "Liên hệ case Cường",
        text: "Team là mô hình thu nhỏ của tập thể; Cường là người lãnh đạo trong phạm vi chiến dịch. Nếu Cường gắn bó với team thì thúc đẩy chiến dịch; nếu tách khỏi team thì trở thành lực cản.",
      },
    ],
    script:
      "Sau ending, nhóm em phân tích đầy đủ phần quần chúng nhân dân và lãnh tụ. Trước hết, quần chúng nhân dân là những lực lượng đông đảo có lợi ích căn bản chung, liên kết thành tập thể để giải quyết những nhiệm vụ của thời đại. Trong bài của nhóm em, team sinh viên được dùng như một mô hình thu nhỏ để minh họa vai trò của tập thể. Tiếp theo, vĩ nhân hay lãnh tụ là cá nhân kiệt xuất, xuất hiện từ phong trào quần chúng, có khả năng tập hợp, định hướng và thống nhất hành động của quần chúng. Vì vậy, Cường không thể được xem là lãnh tụ đúng nghĩa nếu cậu chỉ có danh tiếng nhưng không gắn bó với team. Về vai trò, quần chúng là chủ thể sáng tạo chân chính ra lịch sử, là lực lượng quyết định kết quả; còn lãnh tụ có vai trò dẫn dắt, định hướng và tổ chức hành động. Mối quan hệ giữa hai bên là quan hệ biện chứng: quần chúng quyết định, lãnh tụ dẫn dắt; lãnh tụ xuất hiện từ phong trào quần chúng và chỉ có ý nghĩa khi đại diện cho lợi ích của quần chúng.",
  };

  const TIET53_AFTER_ENDING = {
    tag: "Vấn đề con người ở Việt Nam",
    title: "Từ case Cường đến bài học xây dựng con người sinh viên hiện nay",
    points: [
      "Video : dùng case Cường để phân tích quan hệ cá nhân - tập thể.",
      "Liên hệ: rút ra bài học rộng hơn về xây dựng con người trong thực tiễn Việt Nam.",
    ],
    cards: [
      {
        icon: "👥",
        title: "Hồ Chí Minh về con người",
        text: "Con người không phải cá thể cô lập; con người nằm trong quan hệ gia đình, bạn bè, đồng bào, dân tộc và nhân loại.",
      },
      {
        icon: "🔥",
        title: "Mục tiêu và động lực",
        text: "Thành viên không phải công cụ tạo thành tích cho leader. Khi con người được tôn trọng, tập thể mới có động lực phát triển.",
      },
      {
        icon: "🌱",
        title: "Xây dựng sinh viên hiện nay",
        text: "Phát triển năng lực cá nhân phải đi cùng trách nhiệm cộng đồng, tinh thần hợp tác, chống kiêu ngạo và độc đoán.",
      },
    ],
    script:
      "Nếu Tiết 52 giúp nhóm em phân tích vì sao Cường thành công hoặc thất bại trong quan hệ với tập thể, thì Tiết 53 giúp rút ra bài học rộng hơn: trong thực tiễn Việt Nam hiện nay, xây dựng con người không chỉ là phát triển năng lực cá nhân, mà còn là hình thành con người biết tôn trọng cộng đồng, biết hợp tác và biết gắn lợi ích của mình với lợi ích chung.",
  };

  const DECISIONS = [
    {
      id: 1,
      triggerTime: TIMES.decision1WaitStart,
      waitStart: TIMES.decision1WaitStart,
      waitEnd: TIMES.decision1WaitEnd,
      tag: "Quyết định 1",
      question: "BẠN LÀ CƯỜNG. BẠN SẼ CHỌN GÌ?",
      choices: [
        {
          key: 1,
          text: "TỰ MÌNH CHỐT TOÀN BỘ KẾ HOẠCH",
          sub: "Giữ quyền kiểm soát",
          seekTo: TIMES.choice1ControlStart,
          endTime: TIMES.choice1ControlEnd,
          stats: { trust: -20, morale: -15, burnout: 15, power: -15 },
          statEffects: [
            "TÍN NHIỆM -20",
            "TINH THẦN -15",
            "ÁP LỰC +15",
            "ĐOÀN KẾT -15",
          ],
        },
        {
          key: 2,
          text: "LẮNG NGHE VÀ PHÂN QUYỀN CHO TEAM",
          sub: "Tin tưởng tập thể",
          seekTo: TIMES.choice1TeamStart,
          endTime: TIMES.choice1TeamEnd,
          stats: { trust: 15, morale: 15, burnout: -5, power: 20 },
          statEffects: [
            "TÍN NHIỆM +15",
            "TINH THẦN +15",
            "ÁP LỰC -5",
            "ĐOÀN KẾT +20",
          ],
        },
      ],
    },
    {
      id: 2,
      triggerTime: TIMES.decision2WaitStart,
      waitStart: TIMES.decision2WaitStart,
      waitEnd: TIMES.decision2WaitEnd,
      tag: "Quyết định 2",
      question: "NGÂN SÁCH ĐANG THIẾU NGHIÊM TRỌNG.",
      choices: [
        {
          key: 1,
          text: "GIẤU VẤN ĐỀ",
          sub: "Giữ hình ảnh hoàn hảo trước công chúng",
          seekTo: TIMES.choice2HideStart,
          endTime: TIMES.choice2HideEnd,
          stats: { trust: -25, morale: -20, burnout: 25, power: -20 },
          statEffects: [
            "TÍN NHIỆM -25",
            "TINH THẦN -20",
            "ÁP LỰC +25",
            "ĐOÀN KẾT -20",
          ],
        },
        {
          key: 2,
          text: "MINH BẠCH VỚI TEAM",
          sub: "Cùng tập thể tìm cách giải quyết",
          seekTo: TIMES.choice2OpenStart,
          endTime: TIMES.choice2OpenEnd,
          stats: { trust: 20, morale: 10, burnout: -10, power: 15 },
          statEffects: [
            "TÍN NHIỆM +20",
            "TINH THẦN +10",
            "ÁP LỰC -10",
            "ĐOÀN KẾT +15",
          ],
        },
      ],
    },
    {
      id: 3,
      triggerTime: TIMES.decision3WaitStart,
      waitStart: TIMES.decision3WaitStart,
      waitEnd: TIMES.decision3WaitEnd,
      tag: "Quyết định 3",
      question: "KHỦNG HOẢNG ĐÃ XẢY RA.",
      choices: [
        {
          key: 1,
          text: "QUÁT MẮNG VÀ RA LỆNH TUYỆT ĐỐI",
          sub: "Ép mọi người làm theo mình",
          seekTo: TIMES.choice3BlameStart,
          endTime: TIMES.choice3BlameEnd,
          stats: { trust: -35, morale: -30, burnout: 35, power: -30 },
          statEffects: [
            "TÍN NHIỆM -35",
            "TINH THẦN -30",
            "ÁP LỰC +35",
            "ĐOÀN KẾT -30",
          ],
        },
        {
          key: 2,
          text: "TIN TƯỞNG VÀ TRAO QUYỀN CHO TEAM",
          sub: "Cùng nhau cứu lấy chiến dịch",
          seekTo: TIMES.choice3TrustStart,
          endTime: TIMES.choice3TrustEnd,
          stats: { trust: 30, morale: 25, burnout: -15, power: 30 },
          statEffects: [
            "TÍN NHIỆM +30",
            "TINH THẦN +25",
            "ÁP LỰC -15",
            "ĐOÀN KẾT +30",
          ],
        },
      ],
    },
  ];

  const updateStatsHUD = () => {
    trust = Math.max(0, Math.min(100, trust));
    morale = Math.max(0, Math.min(100, morale));
    burnout = Math.max(0, Math.min(100, burnout));
    power = Math.max(0, Math.min(100, power));

    const bTrust = document.getElementById("bar-trust");
    const bMorale = document.getElementById("bar-morale");
    const bBurnout = document.getElementById("bar-burnout");
    const bPower = document.getElementById("bar-power");

    if (bTrust) bTrust.style.width = trust + "%";
    if (bMorale) bMorale.style.width = morale + "%";
    if (bBurnout) bBurnout.style.width = burnout + "%";
    if (bPower) bPower.style.width = power + "%";

    const vTrust = document.getElementById("val-trust");
    const vMorale = document.getElementById("val-morale");
    const vBurnout = document.getElementById("val-burnout");
    const vPower = document.getElementById("val-power");

    if (vTrust) vTrust.textContent = trust;
    if (vMorale) vMorale.textContent = morale;
    if (vBurnout) vBurnout.textContent = burnout;
    if (vPower) vPower.textContent = power;
  };

  const hideMainOverlay = () => {
    if (!overlay) return;
    overlay.style.opacity = "0";
    overlay.style.pointerEvents = "none";
  };

  const showMainOverlay = () => {
    if (!overlay) return;

    const dOverlay = document.getElementById("decision-overlay");
    const rOverlay = document.getElementById("result-overlay");
    const tOverlay = document.getElementById("theory-overlay");

    const isBusy =
      currentDecision ||
      presentationActive ||
      (dOverlay && dOverlay.style.display === "flex") ||
      (rOverlay && rOverlay.style.display === "flex") ||
      (tOverlay && tOverlay.style.display === "flex");

    if (isBusy) {
      hideMainOverlay();
      return;
    }

    overlay.style.opacity = "1";
    overlay.style.pointerEvents = "auto";
  };

  const resetGame = () => {
    trust = 50;
    morale = 50;
    burnout = 20;
    power = 50;

    currentDecision = null;
    activeChoice = null;
    activeEnding = null;
    completedEnding = false;
    presentationActive = false;
    shownPresentationStops = new Set();
    choiceHistory = [];
    hasTriggeredThisDecision = [false, false, false];

    updateStatsHUD();

    const dOverlay = document.getElementById("decision-overlay");
    const rOverlay = document.getElementById("result-overlay");
    const tOverlay = document.getElementById("theory-overlay");

    if (dOverlay) dOverlay.style.display = "none";
    if (rOverlay) {
      rOverlay.style.display = "none";
      rOverlay.style.opacity = "1";
    }
    if (tOverlay) tOverlay.style.display = "none";
  };

  const renderTheoryOverlay = (data, options = {}) => {
    const tOverlay = document.getElementById("theory-overlay");
    const tTag = document.getElementById("theory-tag");
    const tTitle = document.getElementById("theory-title");
    const tPoints = document.getElementById("theory-points");
    const tCards = document.getElementById("theory-cards");
    const tScript = document.getElementById("theory-script");
    const tContinue = document.getElementById("theory-continue");
    const tSecondary = document.getElementById("theory-secondary");

    if (!tOverlay) return;

    presentationActive = true;
    video.pause();
    hideMainOverlay();

    if (tTag) tTag.textContent = data.tag || "Phân tích";
    if (tTitle) tTitle.textContent = data.title || "—";

    if (tPoints) {
      tPoints.innerHTML = "";
      (data.points || []).forEach((point) => {
        const li = document.createElement("li");
        li.textContent = point;
        tPoints.appendChild(li);
      });
    }

    if (tCards) {
      tCards.innerHTML = "";
      if (data.cards && data.cards.length) {
        tCards.style.display = "grid";
        data.cards.forEach((card) => {
          const div = document.createElement("div");
          div.className = "theory-mini-card";
          div.innerHTML = `
            <span class="theory-mini-icon">${card.icon}</span>
            <strong>${card.title}</strong>
            <p>${card.text}</p>
          `;
          tCards.appendChild(div);
        });
      } else {
        tCards.style.display = "none";
      }
    }

    if (tScript) tScript.textContent = data.script || "";

    if (tContinue) {
      tContinue.textContent = options.continueLabel || "Tiếp tục video";
      tContinue.onclick = (e) => {
        e.stopPropagation();
        tOverlay.style.display = "none";
        presentationActive = false;

        if (options.onContinue) {
          options.onContinue();
        } else {
          video.play();
        }
      };
    }

    if (tSecondary) {
      if (options.secondaryLabel && options.onSecondary) {
        tSecondary.style.display = "inline-flex";
        tSecondary.textContent = options.secondaryLabel;
        tSecondary.onclick = (e) => {
          e.stopPropagation();
          options.onSecondary();
        };
      } else {
        tSecondary.style.display = "none";
      }
    }

    tOverlay.style.display = "flex";
  };

  const triggerDecision = (dec, index) => {
    currentDecision = dec;

    if (typeof index === "number") {
      hasTriggeredThisDecision[index] = true;
    }

    // Đưa video về đúng frame chờ của decision
    video.currentTime = dec.waitStart;

    const dTag = document.getElementById("decision-tag");
    const dQuest = document.getElementById("decision-question");
    const c1Text = document.getElementById("choice-1-text");
    const c1Sub = document.getElementById("choice-1-sub");
    const c2Text = document.getElementById("choice-2-text");
    const c2Sub = document.getElementById("choice-2-sub");

    if (dTag) dTag.textContent = dec.tag;
    if (dQuest) dQuest.textContent = dec.question;
    if (c1Text) c1Text.textContent = dec.choices[0].text;
    if (c1Sub) c1Sub.textContent = dec.choices[0].sub;
    if (c2Text) c2Text.textContent = dec.choices[1].text;
    if (c2Sub) c2Sub.textContent = dec.choices[1].sub;

    const dOverlay = document.getElementById("decision-overlay");
    if (dOverlay) dOverlay.style.display = "flex";

    hideMainOverlay();

    // Quan trọng:
    // Khi tới decision thì DỪNG video hẳn.
    // Không để video chạy nền, tránh bị trôi qua scene khác.
    video.pause();
  };

  const jumpToDecision = (decisionIndex) => {
    const dec = DECISIONS[decisionIndex];
    if (!dec) return;
    triggerDecision(dec, decisionIndex);
  };

  const selectChoice = (index) => {
    if (!currentDecision) return;

    const dec = currentDecision;
    const choice = dec.choices[index];

    choiceHistory[dec.id - 1] = choice.key;
    currentDecision = null;
    activeChoice = {
      ...choice,
      decisionId: dec.id,
    };

    const dOverlay = document.getElementById("decision-overlay");
    if (dOverlay) dOverlay.style.display = "none";

    video.pause();

    trust += choice.stats.trust;
    morale += choice.stats.morale;
    burnout += choice.stats.burnout;
    power += choice.stats.power;

    updateStatsHUD();

    const resultOverlay = document.getElementById("result-overlay");
    const rBadge = document.getElementById("result-badge");
    const rText = document.getElementById("result-text");
    const rStats = document.getElementById("result-stats");

    if (rBadge) rBadge.textContent = `${dec.tag} · Lựa chọn ${choice.key}`;
    if (rText) rText.textContent = choice.text;

    if (rStats) {
      rStats.innerHTML = "";
      choice.statEffects.forEach((effect) => {
        const pill = document.createElement("span");
        if (effect.includes("ÁP LỰC")) {
          pill.className =
            "result-stat-pill " +
            (effect.includes("-") ? "positive" : "negative");
        } else {
          pill.className =
            "result-stat-pill " +
            (effect.includes("+") ? "positive" : "negative");
        }
        pill.textContent = effect;
        rStats.appendChild(pill);
      });
    }

    if (resultOverlay) {
      resultOverlay.style.opacity = "1";
      resultOverlay.style.display = "flex";
    }

    setTimeout(() => {
      if (resultOverlay) {
        resultOverlay.style.opacity = "0";
        setTimeout(() => {
          resultOverlay.style.display = "none";
          resultOverlay.style.opacity = "1";
        }, 300);
      }

      video.currentTime = choice.seekTo;
      video.play();
    }, 1400);
  };

  const determineAndJumpToEnding = () => {
    const path = choiceHistory.join("");

    if (path === "111") {
      activeEnding = {
        name: "BAD ENDING",
        startTime: TIMES.endingBadStart,
        endTime: TIMES.endingBadEnd,
      };
    } else if (path === "222") {
      activeEnding = {
        name: "GOOD ENDING",
        startTime: TIMES.endingGoodStart,
        endTime: TIMES.endingGoodEnd,
      };
    } else {
      activeEnding = {
        name: "MIXED ENDING",
        startTime: TIMES.endingMixedStart,
        endTime: TIMES.endingMixedEnd,
      };
    }

    video.currentTime = activeEnding.startTime;
    video.play();
  };

  const resetTriggersBasedOnTime = (time) => {
    for (let i = 0; i < DECISIONS.length; i++) {
      if (time < DECISIONS[i].triggerTime) {
        hasTriggeredThisDecision[i] = false;
        choiceHistory[i] = undefined;
      }
    }

    if (time < STOP_T52_INDIVIDUAL.time) {
      shownPresentationStops.delete(STOP_T52_INDIVIDUAL.id);
    }

    currentDecision = null;
    activeChoice = null;
    activeEnding = null;
    completedEnding = false;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  };

  if (video && overlay && playBtn) {
    const overlayText = document.querySelector(".video-overlay-text");

    playBtn.addEventListener("click", () => {
      if (completedEnding || video.currentTime < 2) {
        video.currentTime = 0;
        resetGame();

        if (overlayText) {
          overlayText.innerHTML =
            "🎬 Hào quang hay Tập thể? &middot; Nhấn để bắt đầu";
        }
      }

      hideMainOverlay();

      // Không hiện overlay ngay từ đầu.
      // Video sẽ chạy từ 0s → đến giây thứ 6 thì timeupdate tự hiện INTRO_BRIEFING.
      video.play();
    });

    video.addEventListener("pause", showMainOverlay);
    video.addEventListener("ended", showMainOverlay);

    video.addEventListener("play", () => {
      hideMainOverlay();
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        if (completedEnding) {
          video.currentTime = 0;
          resetGame();
          if (overlayText) {
            overlayText.innerHTML =
              "🎬 Hào quang hay Tập thể? &middot; Nhấn để bắt đầu";
          }
          showMainOverlay();
          return;
        }

        if (currentDecision) {
          video.pause();
          return;
        }

        if (video.paused) video.play();
        else video.pause();
      });

      video.addEventListener("play", () => {
        playPauseBtn.textContent = "⏸ Pause";
      });

      video.addEventListener("pause", () => {
        playPauseBtn.textContent = "▶ Play";
      });
    }

    video.addEventListener("timeupdate", () => {
      const t = video.currentTime;
      const duration = video.duration || MASTER_DURATION;

      if (progressBarEl) {
        const pct = (t / duration) * 100;
        progressBarEl.style.width = pct + "%";
      }

      if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(t)} / ${formatTime(duration)}`;
      }

      if (presentationActive) return;

      if (
        t >= TIMES.introVideoStart &&
        t < TIMES.introVideoStart + 0.6 &&
        !shownPresentationStops.has(INTRO_BRIEFING.id)
      ) {
        shownPresentationStops.add(INTRO_BRIEFING.id);
        renderTheoryOverlay(INTRO_BRIEFING, {
          continueLabel: "Tiếp tục xem intro Cường",
        });
        return;
      }

      /* Dừng phân tích Tiết 52: cá nhân - xã hội ở giây 41. */
      if (
        t >= STOP_T52_INDIVIDUAL.time &&
        t < STOP_T52_INDIVIDUAL.time + 0.6 &&
        !shownPresentationStops.has(STOP_T52_INDIVIDUAL.id) &&
        !currentDecision &&
        !activeChoice &&
        !activeEnding
      ) {
        shownPresentationStops.add(STOP_T52_INDIVIDUAL.id);
        renderTheoryOverlay(STOP_T52_INDIVIDUAL);
        return;
      }

      /* Nếu đang ở decision thì dừng video hẳn, không loop nền. */
      if (currentDecision) {
        if (!video.paused) {
          video.pause();
        }
        return;
      }

      /* Khi nhánh được chọn chạy xong: không chạy nhánh còn lại, mà dừng phân tích rồi nhảy sang decision tiếp theo. */
      if (activeChoice && t >= activeChoice.endTime) {
        const choice = activeChoice;
        activeChoice = null;

        if (choice.decisionId === 1) {
          // Sau Decision 1:
          // 1. Nhảy tới giây 77
          // 2. Hiện STOP_T52_INDIVIDUAL_2
          // 3. Sau đó hiện POST_CHOICE_ANALYSIS[1]
          // 4. Rồi mới sang Decision 2

          video.currentTime = TIMES.t52IndividualStop2;

          renderTheoryOverlay(STOP_T52_INDIVIDUAL_2, {
            continueLabel: "Tiếp tục phân tích chủ nghĩa cá nhân",
            onContinue: () => {
              video.currentTime = TIMES.t52IndividualStop2a;

              renderTheoryOverlay(POST_CHOICE_ANALYSIS[1], {
                continueLabel: "Sang quyết định 2",
                onContinue: () => {
                  // Không nhảy thẳng đến decision 2.
                  // Cho video chạy từ giây 78 đến TIMES.decision2WaitStart.
                  video.currentTime = TIMES.t52IndividualStop2a;
                  video.play();
                },
              });
            },
          });
        } else if (choice.decisionId === 2) {
          renderTheoryOverlay(POST_CHOICE_ANALYSIS[2], {
            continueLabel: "Sang quyết định 3",
            onContinue: () => {
              video.currentTime = TIMES.t52IndividualStop3;
              video.play();
            },
          });
        } else if (choice.decisionId === 3) {
          determineAndJumpToEnding();
        }
        return;
      }

      /* Ending kết thúc: dừng phân tích Tiết 52 trước, rồi mới hiện 3 card Tiết 53. */
      /* Ending kết thúc:
   - Chặn sớm hơn một chút để không bị trôi sang ending kế tiếp.
   - Bad Ending không chạy tiếp Good Ending.
   - Good Ending không chạy tiếp Mixed Ending.
*/
      if (activeEnding && t >= activeEnding.endTime - ENDING_EPSILON) {
        const endedName = activeEnding.name;
        const endingStopTime = activeEnding.endTime - ENDING_EPSILON;

        // Dừng ngay trong đoạn ending hiện tại, không để video chạm frame đầu của ending sau.
        video.pause();
        video.currentTime = endingStopTime;

        activeEnding = null;
        completedEnding = true;

        renderTheoryOverlay(STOP_T52_AFTER_ENDING, {
          continueLabel: "Tiếp tục sang Tiết 53",
          onContinue: () => {
            renderFinalEffectOverlay(() => {
              renderTheoryOverlay(TIET53_AFTER_ENDING, {
                continueLabel: "Kết thúc phần video",
                secondaryLabel: "Mở phần Tiết 53 bên dưới",
                onContinue: () => {
                  if (overlayText) {
                    overlayText.innerHTML = `
              🏁 <strong>HOÀN THÀNH: ${endedName}</strong><br/>
              <span>Đã phân tích Tiết 52 và Tiết 53 ngay trên video.</span><br/>
              <span>Nhấn Play để xem lại từ đầu.</span>
            `;
                  }

                  showMainOverlay();
                },
                onSecondary: () => {
                  const tiet53 = document.getElementById("viet-nam");
                  if (tiet53) {
                    tiet53.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                },
              });
            });
          },
        });
        const renderFinalEffectOverlay = (onDone) => {
          const effectOverlay = document.getElementById("final-effect-overlay");
          const effectIcon = document.getElementById("final-effect-icon");
          const effectTitle = document.getElementById("final-effect-title");
          const effectMessage = document.getElementById("final-effect-message");

          if (!effectOverlay) {
            if (onDone) onDone();
            return;
          }

          const isSuccess = burnout <= 0;

          effectOverlay.classList.remove("success", "failure");
          effectOverlay.classList.add(isSuccess ? "success" : "failure");

          if (isSuccess) {
            if (effectIcon) effectIcon.textContent = "🎉";
            if (effectTitle) effectTitle.textContent = "Áp lực về 0!";
            if (effectMessage) {
              effectMessage.textContent =
                "Cường đã biết tin tưởng, lắng nghe và trao quyền. Khi áp lực được giải tỏa, tập thể trở thành động lực cứu chiến dịch.";
            }
          } else {
            if (effectIcon) effectIcon.textContent = "⚠️";
            if (effectTitle) effectTitle.textContent = "Áp lực vẫn còn!";
            if (effectMessage) {
              effectMessage.textContent =
                "Những lựa chọn trước đó vẫn để lại hệ quả. Khi niềm tin chưa được khôi phục, tập thể khó phát huy hết sức mạnh.";
            }
          }

          presentationActive = true;
          hideMainOverlay();
          effectOverlay.style.display = "flex";

          setTimeout(() => {
            effectOverlay.style.display = "none";
            presentationActive = false;

            if (onDone) onDone();
          }, 2600);
        };

        return;
      }

      /* Trigger decision wait overlays. */
      for (let i = 0; i < DECISIONS.length; i++) {
        const dec = DECISIONS[i];
        if (
          t >= dec.triggerTime &&
          t < dec.triggerTime + 0.8 &&
          !hasTriggeredThisDecision[i]
        ) {
          triggerDecision(dec, i);
          return;
        }
      }
    });

    if (progressWrap) {
      progressWrap.addEventListener("click", (e) => {
        const rect = progressWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPct = clickX / width;
        const newTime = clickPct * (video.duration || MASTER_DURATION);

        video.currentTime = newTime;
        resetTriggersBasedOnTime(newTime);
      });
    }

    const choice1El = document.getElementById("choice-1");
    const choice2El = document.getElementById("choice-2");

    if (choice1El) choice1El.addEventListener("click", () => selectChoice(0));
    if (choice2El) choice2El.addEventListener("click", () => selectChoice(1));

    document.addEventListener("keydown", (e) => {
      if (presentationActive) {
        const tContinue = document.getElementById("theory-continue");
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (tContinue) tContinue.click();
        }
        return;
      }

      if (!currentDecision) return;

      if (e.key === "1") selectChoice(0);
      else if (e.key === "2") selectChoice(1);
    });

    updateStatsHUD();
  }

  /* ── 7. SMOOTH SCROLL for CTA buttons ─ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── 8. Q&A SECTION – stagger badge animation ── */
  const qaSection = document.getElementById("qa");
  if (qaSection) {
    const qaBadges = qaSection.querySelectorAll(
      ".qa-group-badge, .qa-group-chip",
    );
    const qaObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          qaBadges.forEach((badge, i) => {
            setTimeout(() => {
              badge.style.opacity = "1";
              badge.style.transform = "translateY(0)";
            }, i * 100);
          });
        }
      },
      { threshold: 0.3 },
    );

    // Initial state for badges
    qaBadges.forEach((badge) => {
      badge.style.opacity = "0";
      badge.style.transform = "translateY(20px)";
      badge.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    qaObserver.observe(qaSection);
  }

  /* ── 9. KEYBOARD SHORTCUT: 'Q' → jump to Q&A ── */
  document.addEventListener("keydown", (e) => {
    if (e.key === "q" || e.key === "Q") {
      const qa = document.getElementById("qa");
      if (qa) qa.scrollIntoView({ behavior: "smooth" });
    }
  });
});
