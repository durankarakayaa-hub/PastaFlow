import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import ArialFont from "./ArialFont";
function Reports() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);

  const [branch, setBranch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [report, setReport] = useState(null);
  const [reportProducts, setReportProducts] = useState([]);
const [reportMovements, setReportMovements] = useState([]);
const [currentUser, setCurrentUser] = useState(null);
const [branches, setBranches] = useState([]);
const [aiAnalysis, setAiAnalysis] = useState("");
const [aiLoading, setAiLoading] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("pastaflow_token");

fetch("http://localhost:3001/me", {
  headers: {
    Authorization: "Bearer " + token,
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log("👤 RAPOR KULLANICISI:", data);

    if (data.success) {
  setCurrentUser(data.user);

  // PERSONELİN ŞUBESİNİ RAPOR FİLTRESİNE OTOMATİK ATA
  if (
    data.user.role !== "YONETICI" &&
    data.user.branch
  ) {
    setBranch(data.user.branch);
  }
}
  });
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));

    fetch("http://localhost:3001/stock-movements", {
  headers: {
    Authorization:
      "Bearer " +
      localStorage.getItem("pastaflow_token"),
  },
})
  .then((res) => res.json())
  .then((data) => {
    console.log("📊 RAPOR HAREKETLERİ:", data);

    if (data.success) {
      setMovements(data.movements);
    } else {
      console.error(
        "Hareketler alınamadı:",
        data.message
      );
    }
  })
  .catch((err) => {
    console.error(
      "Hareket API hatası:",
      err
    );
  });
  fetch("http://localhost:3001/branches")
  .then((res) => res.json())
  .then((data) => {
    const activeBranches = data
      .filter((branch) => branch.status === "AKTIF")
      .map((branch) => branch.name);

    setBranches(activeBranches);

    console.log("📍 RAPOR ŞUBELERİ:", activeBranches);
  })
  .catch((err) => {
    console.error("Şubeler alınamadı:", err);
  });
  }, []);

 const createReport = () => {
  let filteredProducts = [...products];
  let filteredMovements = [...movements];

  // =========================
  // GÜVENLİ ŞUBE FİLTRESİ
  // =========================

  const isManager =
    currentUser?.role === "YONETICI";

  const selectedBranch =
    isManager
      ? branch
      : currentUser?.branch || "";

  // =========================
  // ŞUBE FİLTRESİ
  // =========================

  if (selectedBranch !== "") {

    filteredProducts =
      filteredProducts.filter(
        (p) =>
          String(p.branch || "")
            .trim()
            .toUpperCase() ===
          String(selectedBranch)
            .trim()
            .toUpperCase()
      );

    filteredMovements =
      filteredMovements.filter(
        (m) =>
          String(m.from_branch || "")
            .trim()
            .toUpperCase() ===
            String(selectedBranch)
              .trim()
              .toUpperCase()
          ||
          String(m.to_branch || "")
            .trim()
            .toUpperCase() ===
            String(selectedBranch)
              .trim()
              .toUpperCase()
      );
  }

  // =========================
  // TARİH FİLTRESİ
  // =========================

  if (startDate !== "") {

    filteredMovements =
      filteredMovements.filter(
        (m) =>
          m.created_at &&
          m.created_at.slice(0, 10) >=
            startDate
      );
  }

  if (endDate !== "") {

    filteredMovements =
      filteredMovements.filter(
        (m) =>
          m.created_at &&
          m.created_at.slice(0, 10) <=
            endDate
      );
  }

  // =========================
  // RAPOR VERİLERİ
  // =========================

  setReportProducts(filteredProducts);
  setReportMovements(filteredMovements);

  setReport({

    totalProducts:
      filteredProducts.length,

    criticalProducts:
      filteredProducts.filter(
        (p) =>
          Number(p.critical || 0) > 0 &&
          Number(p.stock || 0) <=
            Number(p.critical || 0)
      ).length,

    stockIn:
      filteredMovements.filter(
        (m) =>
          m.type === "STOK GİRİŞİ"
      ).length,

    stockOut:
      filteredMovements.filter(
        (m) =>
          m.type === "STOK ÇIKIŞI"
      ).length,

    transfer:
      filteredMovements.filter(
        (m) =>
          m.type === "TRANSFER"
      ).length,

    totalStock:
      filteredProducts.reduce(
        (toplam, p) =>
          toplam +
          Number(p.stock || 0),
        0
      ),

    branch:
      selectedBranch ||
      "Tüm Şubeler",
  });
};
  // =========================
  // 🤖 PASTAFLOW AI ANALİZİ
  // =========================

  const generateAIAnalysis = () => {

    setAiLoading(true);
    setAiAnalysis("");

    try {

      const dataProducts =
        report
          ? reportProducts
          : products;

      const dataMovements =
        report
          ? reportMovements
          : movements;

      // =========================
      // ÜRÜN ANALİZİ
      // =========================

      const criticalProducts =
        dataProducts.filter(
          (p) =>
            Number(p.critical) > 0 &&
            Number(p.stock) <= Number(p.critical)
        );

      const outOfStock =
        dataProducts.filter(
          (p) =>
            Number(p.stock) === 0
        );

      const normalProducts =
        dataProducts.filter(
          (p) =>
            Number(p.stock) >
            Number(p.critical)
        );

      // =========================
      // BİRİM ANALİZİ
      // =========================

      const kgProducts =
        dataProducts.filter(
          (p) =>
            String(p.unit || "")
              .toUpperCase() === "KG"
        );

      const adetProducts =
        dataProducts.filter(
          (p) =>
            String(p.unit || "")
              .toUpperCase() === "ADET"
        );

      const totalKG =
        kgProducts.reduce(
          (sum, p) =>
            sum + Number(p.stock || 0),
          0
        );

      const totalAdet =
        adetProducts.reduce(
          (sum, p) =>
            sum + Number(p.stock || 0),
          0
        );

      // =========================
      // HAREKET ANALİZİ
      // =========================

      const stockIn =
        dataMovements.filter(
          (m) =>
            m.type === "STOK GİRİŞİ"
        ).length;

      const stockOut =
        dataMovements.filter(
          (m) =>
            m.type === "STOK ÇIKIŞI"
        ).length;

      const transfers =
        dataMovements.filter(
          (m) =>
            m.type === "TRANSFER"
        ).length;

      const waste =
        dataMovements.filter(
          (m) =>
            m.type === "İMHA"
        ).length;
// =========================
// 📈 TÜKETİM HIZI ANALİZİ
// =========================

const now = new Date();

const consumptionAnalysis = dataProducts.map((product) => {

  const productName =
    String(product.name || "")
      .trim()
      .toLocaleLowerCase("tr-TR");

  const productBranch =
    String(product.branch || "")
      .trim()
      .toLocaleLowerCase("tr-TR");

  // Son 30 gündeki stok çıkışları
  const productOutputs =
    dataMovements.filter((movement) => {

      const movementName =
        String(movement.product_name || movement.product || "")
          .trim()
          .toLocaleLowerCase("tr-TR");

      const movementBranch =
        String(movement.branch || movement.from_branch || "")
          .trim()
          .toLocaleLowerCase("tr-TR");

      const movementDate =
        new Date(
          movement.date ||
          movement.created_at ||
          movement.timestamp
        );

      const daysDifference =
        (now - movementDate) /
        (1000 * 60 * 60 * 24);

      return (
        movement.type === "STOK ÇIKIŞI" &&
        movementName === productName &&
        movementBranch === productBranch &&
        daysDifference >= 0 &&
        daysDifference <= 30
      );

    });

  const totalOutput =
    productOutputs.reduce(
      (sum, movement) =>
        sum + Number(movement.quantity || movement.amount || 0),
      0
    );

  const dailyAverage =
    totalOutput / 30;

  const currentStock =
    Number(product.stock || 0);

  const estimatedDays =
    dailyAverage > 0
      ? currentStock / dailyAverage
      : null;

  return {
    product,
    totalOutput,
    dailyAverage,
    estimatedDays,
  };

});
// =========================
// 📅 STOK BİTİŞ TAHMİNİ
// =========================

const stockRiskProducts =
  consumptionAnalysis
    .filter((item) => {

      // Tüketim verisi olmayanları alma
      if (
        item.dailyAverage <= 0 ||
        item.estimatedDays === null
      ) {
        return false;
      }

      // 7 gün içinde bitecek ürünler
      return item.estimatedDays <= 7;

    })
    .sort(
      (a, b) =>
        a.estimatedDays -
        b.estimatedDays
    );
      // =========================
      // ŞUBE ANALİZİ
      // =========================

      const branchMap = {};

dataProducts.forEach((product) => {

  const branchName =
  String(product.branch || "Bilinmeyen")
    .trim()
    .toLocaleUpperCase("tr-TR");

  const unit =
    String(product.unit || "")
      .trim()
      .toUpperCase();

  if (!branchMap[branchName]) {

    branchMap[branchName] = {
      products: 0,
      kg: 0,
      adet: 0,
      critical: 0,
    };

  }

  branchMap[branchName].products++;

  const stock =
    Number(product.stock || 0);

  // KG ve ADET birbirine karışmayacak
  if (unit === "KG") {

    branchMap[branchName].kg += stock;

  } else if (unit === "ADET") {

    branchMap[branchName].adet += stock;

  }

  if (
    Number(product.critical) > 0 &&
    stock <= Number(product.critical)
  ) {

    branchMap[branchName].critical++;

  }

});

      const branchAnalysis =
  Object.entries(branchMap)
    .map(([name, data]) => {

      return (
        `${name}: ${data.products} ürün | ` +
        `${data.kg.toFixed(3)} KG | ` +
        `${data.adet.toFixed(2)} ADET | ` +
        `${data.critical} kritik`
      );

    })
    .join("\n");

      // =========================
      // AI RAPOR METNİ
      // =========================

      let analysis = "";

      analysis +=
        "🤖 PastaFlow AI Stok Analizi\n\n";

      analysis +=
        `📦 Toplam ürün: ${dataProducts.length}\n`;

      analysis +=
        `🟢 Normal ürün: ${normalProducts.length}\n`;

      analysis +=
        `🟠 Kritik ürün: ${criticalProducts.length}\n`;

      analysis +=
        `🔴 Stokta olmayan: ${outOfStock.length}\n\n`;

      analysis +=
        `⚖️ KG ürün sayısı: ${kgProducts.length}\n`;

      analysis +=
        `📦 ADET ürün sayısı: ${adetProducts.length}\n`;

      analysis +=
        `⚖️ Toplam KG stok: ${totalKG.toFixed(3)} KG\n`;

      analysis +=
        `📦 Toplam ADET stok: ${totalAdet} ADET\n\n`;
  // =========================
// ⚠️ BİRİM KONTROLÜ
// =========================

const validOtherUnits = [
  "PAKET",
  "KOLİ",
  "KOLI",
  "KUTU",
  "LİTRE",
  "LITRE",
  "ML",
  "GRAM",
  "GR",
  "TON",
];

const undefinedUnitProducts =
  dataProducts.filter((product) => {

    const unit =
      String(product.unit || "")
        .trim()
        .toUpperCase();

    return (
      unit === "" ||
      unit === "-" ||
      unit === "TANIMSIZ" ||
      unit === "NULL" ||
      unit === "YOK"
    );

  });

const otherUnitProducts =
  dataProducts.filter((product) => {

    const unit =
      String(product.unit || "")
        .trim()
        .toUpperCase();

    return (
      unit !== "" &&
      unit !== "KG" &&
      unit !== "ADET" &&
      unit !== "-" &&
      unit !== "TANIMSIZ" &&
      unit !== "NULL" &&
      unit !== "YOK"
    );

  });


// -------------------------
// TANIMSIZ BİRİMLER
// -------------------------

if (undefinedUnitProducts.length > 0) {

  analysis +=
    `⚠️ Birimi eksik/tanımsız ürün: ${undefinedUnitProducts.length}\n`;

  analysis +=
    "Bu ürünler KG ve ADET stok toplamlarına dahil edilmemiştir.\n";

  undefinedUnitProducts
    .slice(0, 10)
    .forEach((product) => {

      analysis +=
        `   🔸 ${product.name} — ${product.branch} — Birim: TANIMSIZ\n`;

    });

  if (undefinedUnitProducts.length > 10) {

    analysis +=
      `   ... ve ${undefinedUnitProducts.length - 10} ürün daha.\n`;

  }

} else {

  analysis +=
    "✅ Birimi eksik/tanımsız ürün bulunmuyor.\n";

}


// -------------------------
// DİĞER GEÇERLİ BİRİMLER
// -------------------------

if (otherUnitProducts.length > 0) {

  analysis +=
    `📦 KG/ADET dışında birim kullanan ürün: ${otherUnitProducts.length}\n`;

  otherUnitProducts
    .slice(0, 10)
    .forEach((product) => {

      const unit =
        String(product.unit || "")
          .trim()
          .toUpperCase();

      analysis +=
        `   🔸 ${product.name} — ${product.branch} — Birim: ${unit}\n`;

    });

  if (otherUnitProducts.length > 10) {

    analysis +=
      `   ... ve ${otherUnitProducts.length - 10} ürün daha.\n`;

  }

}

analysis += "\n";

      analysis +=
        "📊 Hareket Özeti\n";

      analysis +=
        `📥 Stok girişleri: ${stockIn}\n`;

      analysis +=
        `📤 Stok çıkışları: ${stockOut}\n`;

      analysis +=
        `🚚 Transferler: ${transfers}\n`;

      analysis +=
        `🗑️ İmhâlar: ${waste}\n\n`;

      // =========================
      // KRİTİK ÜRÜNLER
      // =========================

      analysis +=
        "⚠️ Kritik Ürünler\n";

      if (
        criticalProducts.length === 0
      ) {

        analysis +=
          "Kritik seviyede ürün bulunmuyor.\n";

      } else {

        criticalProducts
  .slice(0, 10)
  .forEach((product) => {

    const stock =
      Number(product.stock || 0);

    const critical =
      Number(product.critical || 0);

    const difference =
      critical - stock;

    const unit =
      product.unit || "";

    analysis +=
      `🔴 ${product.name} — ${product.branch}\n`;

    analysis +=
      `   Mevcut: ${stock} ${unit}\n`;

    analysis +=
      `   Kritik seviye: ${critical} ${unit}\n`;

    analysis +=
      `   Eksik: ${difference} ${unit}\n`;

  });

        if (
          criticalProducts.length > 10
        ) {

          analysis +=
            `... ve ${criticalProducts.length - 10} kritik ürün daha.\n`;

        }

      }

      analysis += "\n";

      // =========================
      // STOKTA OLMAYANLAR
      // =========================

      analysis +=
        "🚨 Stokta Olmayan Ürünler\n";

      if (
        outOfStock.length === 0
      ) {

        analysis +=
          "Stokta olmayan ürün bulunmuyor.\n";

      } else {

        outOfStock
          .slice(0, 10)
          .forEach(
            (product) => {

              analysis +=
                `🔴 ${product.name} — ${product.branch}\n`;

            }
          );

      }

      analysis += "\n";

      // =========================
      // ŞUBE ANALİZİ
      // =========================

      analysis +=
        "🏪 Şube Analizi\n";

      analysis +=
        branchAnalysis || "Veri bulunamadı.";

      analysis += "\n\n";

     // =========================
// 🤖 AKILLI YÖNETİCİ ÖNERİLERİ
// =========================
// =========================
// 📅 STOK BİTİŞ TAHMİNİ
// =========================

analysis +=
  "📅 Tahmini Stok Bitiş Analizi\n";

if (stockRiskProducts.length === 0) {

  analysis +=
    "🟢 Son 7 gün içinde bitmesi beklenen ürün bulunmuyor.\n";

} else {

  stockRiskProducts
    .slice(0, 10)
    .forEach((item) => {

      const days =
        Math.max(
          0,
          item.estimatedDays
        );

      analysis +=
        `🔴 ${item.product.name} — ${item.product.branch}\n`;

      analysis +=
        `   Tahmini stok bitişi: ${days.toFixed(1)} gün\n`;

      analysis +=
        `   Günlük ortalama tüketim: ${item.dailyAverage.toFixed(2)} ${item.product.unit}\n`;

    });

}

analysis += "\n";
analysis +=
  "💡 PastaFlow Yönetici Önerileri\n";
// -------------------------
// BİRİM KONTROLÜ
// -------------------------

if (undefinedUnitProducts.length > 0) {

  analysis +=
    `⚠️ ${undefinedUnitProducts.length} ürünün birim bilgisi eksik veya tanımsız. ` +
    `Bu ürünlerin birimleri tanımlanmalıdır.\n`;

} else {

  analysis +=
    "🟢 Tüm ürünlerin birim bilgileri tanımlı.\n";

}

if (otherUnitProducts.length > 0) {

  analysis +=
    `📦 ${otherUnitProducts.length} ürün KG/ADET dışında birim kullanıyor. ` +
    `Bu ürünler KG ve ADET toplamlarına dahil edilmemiştir.\n`;

}
// -------------------------
// STOKTA OLMAYAN ÜRÜNLER
// -------------------------

if (outOfStock.length > 0) {

  analysis +=
    `🔴 ${outOfStock.length} ürünün stoğu tamamen bitmiş. ` +
    `Bu ürünler için acil stok planlaması yapılmalı.\n`;

} else {

  analysis +=
    "🟢 Stokta tamamen biten ürün bulunmuyor.\n";

}


// -------------------------
// KRİTİK ÜRÜNLER
// -------------------------

if (criticalProducts.length > 0) {

  const criticalRate =
    dataProducts.length > 0
      ? (
          (criticalProducts.length /
            dataProducts.length) *
          100
        ).toFixed(1)
      : 0;

  analysis +=
    `🟠 ${criticalProducts.length} ürün kritik seviyede. ` +
    `Toplam ürünlerin yaklaşık %${criticalRate}'i kritik durumda.\n`;

}


// -------------------------
// TRANSFER ANALİZİ
// -------------------------

if (transfers >= 5) {

  analysis +=
    `🚚 ${transfers} transfer hareketi bulunuyor. ` +
    `Şubeler arası stok dengesinin ayrıca incelenmesi önerilir.\n`;

} else if (transfers > 0) {

  analysis +=
    `🚚 ${transfers} transfer hareketi gerçekleşmiş.\n`;

}


// -------------------------
// İMHA ANALİZİ
// -------------------------

if (waste > 0) {

  analysis +=
    `🗑️ ${waste} imha hareketi bulunuyor. ` +
    `İmha nedenlerinin ürün bazında takip edilmesi önerilir.\n`;

} else {

  analysis +=
    "🟢 Seçilen dönemde imha hareketi bulunmuyor.\n";

}


// -------------------------
// KRİTİK ÜRÜNLERİN ŞUBELERİ
// -------------------------

const criticalBranchMap = {};

criticalProducts.forEach((product) => {

  const branchName =
    product.branch || "Bilinmeyen";

  if (!criticalBranchMap[branchName]) {
    criticalBranchMap[branchName] = 0;
  }

  criticalBranchMap[branchName]++;

});

const criticalBranchText =
  Object.entries(criticalBranchMap)
    .map(
      ([name, count]) =>
        `${name}: ${count} kritik ürün`
    )
    .join(" | ");

if (criticalBranchText) {

  analysis +=
    `⚠️ Kritik stok yoğunluğu: ${criticalBranchText}.\n`;

}

// =========================
// 🚚 GELİŞMİŞ AKILLI TRANSFER MOTORU V2
// =========================

const transferSuggestions = [];

// Ürünlerin kullanılabilir fazla stoklarını
// ayrı bir havuzda tutuyoruz.
// Böylece aynı stok birden fazla kez önerilmez.

const stockPool = dataProducts.map((product) => {

  const stock =
    Number(product.stock || 0);

  const critical =
    Number(product.critical || 0);

  const availableSurplus =
    Math.max(
      0,
      stock - critical
    );

  return {
    ...product,

    remainingSurplus:
      availableSurplus,
  };

});


// Kritik ürünleri en fazla eksiği
// olandan en az eksiğe doğru sırala.

const sortedCriticalProducts =
  [...criticalProducts].sort(
    (a, b) => {

      const aMissing =
        Number(a.critical || 0) -
        Number(a.stock || 0);

      const bMissing =
        Number(b.critical || 0) -
        Number(b.stock || 0);

      return (
        bMissing - aMissing
      );

    }
  );


// Her kritik ürün için
// uygun kaynak şubeleri bul.

sortedCriticalProducts.forEach(
  (criticalProduct) => {

    const productName =
      String(
        criticalProduct.name || ""
      )
        .trim()
        .toLocaleLowerCase("tr-TR");

    const criticalBranch =
      String(
        criticalProduct.branch || ""
      )
        .trim()
        .toLocaleLowerCase("tr-TR");

    const unit =
      String(
        criticalProduct.unit || ""
      )
        .trim()
        .toUpperCase();

    const currentStock =
      Number(
        criticalProduct.stock || 0
      );

    const criticalLevel =
      Number(
        criticalProduct.critical || 0
      );


    // Hedef şubenin ihtiyacı

    let remainingNeed =
      criticalLevel -
      currentStock;


    if (
      remainingNeed <= 0
    ) {
      return;
    }


    // Aynı ürünü
    // diğer şubelerde bul

    const possibleSources =
      stockPool
        .filter((source) => {

          const sourceName =
            String(
              source.name || ""
            )
              .trim()
              .toLocaleLowerCase("tr-TR");

          const sourceBranch =
            String(
              source.branch || ""
            )
              .trim()
              .toLocaleLowerCase("tr-TR");

          const sourceUnit =
            String(
              source.unit || ""
            )
              .trim()
              .toUpperCase();


          return (

            // Aynı ürün

            sourceName ===
              productName &&


            // Aynı birim

            sourceUnit ===
              unit &&


            // Farklı şube

            sourceBranch !==
              criticalBranch &&


            // Gerçekten
            // kullanılabilir fazla stok var

            Number(
              source.remainingSurplus || 0
            ) > 0

          );

        })


        // En fazla
        // kullanılabilir stoğu olan
        // kaynak önce gelsin

        .sort(
          (a, b) =>

            Number(
              b.remainingSurplus || 0
            ) -

            Number(
              a.remainingSurplus || 0
            )

        );


    // Birden fazla kaynak şube
    // kullanılabilir.

    possibleSources.forEach(
      (source) => {

        // Hedefin ihtiyacı
        // zaten karşılandıysa

        if (
          remainingNeed <= 0
        ) {
          return;
        }


        const availableSurplus =
          Number(
            source.remainingSurplus || 0
          );


        // Gönderilebilecek miktar

        const transferAmount =
          Math.min(
            remainingNeed,
            availableSurplus
          );


        if (
          transferAmount <= 0
        ) {
          return;
        }


        // Transfer önerisini ekle

        transferSuggestions.push({

          product:
            criticalProduct.name,

          from:
            source.branch,

          to:
            criticalProduct.branch,

          amount:
            transferAmount,

          unit:
            unit,


          // Kaynak bilgileri

          sourceStock:
            Number(
              source.stock || 0
            ),

          sourceCritical:
            Number(
              source.critical || 0
            ),


          // Hedef bilgileri

          destinationStock:
            currentStock,

          destinationCritical:
            criticalLevel,

        });


        // =========================
        // 🔥 EN ÖNEMLİ KISIM
        // =========================

        // Kaynak şubenin
        // kullanılabilir fazla stoğunu düşür.

        source.remainingSurplus -=
          transferAmount;


        // Hedefin kalan ihtiyacını düşür.

        remainingNeed -=
          transferAmount;

      }
    );

  }
);
// =========================
// TRANSFER ÖNERİLERİNİ RAPORA EKLE
// =========================

analysis += "\n";

analysis +=
  "🚚 Akıllı Transfer Önerileri\n";

if (
  transferSuggestions.length === 0
) {

  analysis +=
    "ℹ️ Kritik ürünler için başka şubelerde uygun fazla stok bulunamadı.\n";

} else {

  transferSuggestions
    .slice(0, 10)
    .forEach((suggestion) => {

      analysis +=
        `🚚 ${suggestion.product}\n`;

      analysis +=
        `   ${suggestion.from} → ${suggestion.to}\n`;

      analysis +=
        `   Önerilen transfer: ${suggestion.amount} ${suggestion.unit}\n`;

      analysis +=
        `   Kaynak stok: ${suggestion.sourceStock} ${suggestion.unit} ` +
        `(kritik: ${suggestion.sourceCritical} ${suggestion.unit})\n`;

      analysis +=
        `   Hedef stok: ${suggestion.destinationStock} ${suggestion.unit} ` +
        `(kritik: ${suggestion.destinationCritical} ${suggestion.unit})\n`;

    });

  if (
    transferSuggestions.length > 10
  ) {

    analysis +=
      `... ve ${transferSuggestions.length - 10} transfer önerisi daha.\n`;

  }

}
// -------------------------
// GENEL DURUM
// -------------------------

if (
  criticalProducts.length === 0 &&
  outOfStock.length === 0
) {

  analysis +=
    "🟢 Genel stok görünümü sağlıklı durumda.\n";

}
      setAiAnalysis(analysis);

    } catch (error) {

      console.error(
        "AI analiz hatası:",
        error
      );

      setAiAnalysis(
        "❌ Analiz sırasında bir hata oluştu."
      );

    }

    setAiLoading(false);

  };
const exportPDF = () => {
  if (!report) {
    alert("Önce rapor oluşturmalısınız.");
    return;
  }

  const doc = new jsPDF();
doc.addFileToVFS("Arial.ttf", ArialFont);
doc.addFont("Arial.ttf", "Arial", "normal");
doc.setFont("Arial");
  // =========================
  // BAŞLIK
  // =========================

  doc.setFontSize(18);
  doc.text("PastaFlow Stok Raporu", 14, 20);

  doc.setFontSize(11);
  doc.text(
    `Şube: ${branch || "Tüm Şubeler"}`,
    14,
    35
  );

  doc.text(
    `Başlangıç: ${startDate || "-"}`,
    14,
    42
  );

  doc.text(
    `Bitiş: ${endDate || "-"}`,
    14,
    49
  );

  // =========================
  // RAPOR ÖZETİ
  // =========================

  autoTable(doc, {
    startY: 60,

    head: [
      ["Bilgi", "Değer"]
    ],

    body: [
      ["Toplam Ürün", report.totalProducts],
      ["Toplam Stok", report.totalStock],
      ["Kritik Ürün", report.criticalProducts],
      ["Stok Girişi", report.stockIn],
      ["Stok Çıkışı", report.stockOut],
      ["Transfer", report.transfer],
    ],
  });
// =========================
  // PASTAFLOW AI ANALİZİ
  // =========================

  if (aiAnalysis) {

    doc.addPage();

    doc.setFontSize(16);
    doc.text(
      "PastaFlow AI Analizi",
      14,
      20
    );

    doc.setFontSize(10);

    const analysisLines =
      doc.splitTextToSize(
        aiAnalysis,
        180
      );

    let y = 32;

    analysisLines.forEach((line) => {

      // Sayfa sonuna gelirse
      if (y > 280) {

        doc.addPage();

        y = 20;

      }

      doc.text(
        line,
        14,
        y
      );

      y += 6;

    });

  }
  // =========================
  // ÜRÜN STOK DETAYI
  // =========================

  let nextY =
    doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);

  doc.text(
    "Ürün Stok Detayı",
    14,
    nextY
  );

  autoTable(doc, {
    startY: nextY + 5,

    head: [[
      "Ürün",
      "Şube",
      "Stok",
      "Kritik",
      "Durum"
    ]],

    body: reportProducts.map(
      (product) => [
        product.name,
        product.branch,
        product.stock,
        product.critical,
        product.stock <= product.critical
          ? "KRİTİK"
          : "NORMAL",
      ]
    ),

    styles: {
      fontSize: 8,
    },
  });

  // =========================
  // HAREKET GEÇMİŞİ
  // =========================

  nextY =
    doc.lastAutoTable.finalY + 15;

  doc.setFontSize(14);

  doc.text(
    "Hareket Geçmişi",
    14,
    nextY
  );

  autoTable(doc, {
    startY: nextY + 5,

    head: [[
      "Tarih",
      "İşlem",
      "Ürün",
      "Miktar",
      "Nereden",
      "Nereye"
    ]],

    body: reportMovements.map(
      (movement) => [
        movement.created_at
          ? movement.created_at
              .replace("T", " ")
              .slice(0, 16)
          : "-",

        movement.type || "-",

        movement.product_name || "-",

        movement.amount || "-",

        movement.from_branch || "-",

        movement.to_branch || "-",
      ]
    ),

    styles: {
      fontSize: 7,
    },
  });

  // =========================
  // PDF KAYDET
  // =========================

  doc.save(
    "PastaFlow-Rapor.pdf"
  );
};
const exportExcel = () => {
  if (!report) {
    alert("Önce rapor oluşturmalısınız.");
    return;
  }

  // =========================
  // EXCEL DOSYASI
  // =========================

  const workbook =
    XLSX.utils.book_new();

  // =========================
  // 1️⃣ RAPOR ÖZETİ
  // =========================

  const summaryData = [
    {
      Bilgi: "Şube",
      Değer:
        branch || "Tüm Şubeler",
    },

    {
      Bilgi: "Başlangıç",
      Değer:
        startDate || "-",
    },

    {
      Bilgi: "Bitiş",
      Değer:
        endDate || "-",
    },

    {
      Bilgi: "Toplam Ürün",
      Değer:
        report.totalProducts,
    },

    {
      Bilgi: "Toplam Stok",
      Değer:
        report.totalStock,
    },

    {
      Bilgi: "Kritik Ürün",
      Değer:
        report.criticalProducts,
    },

    {
      Bilgi: "Stok Girişi",
      Değer:
        report.stockIn,
    },

    {
      Bilgi: "Stok Çıkışı",
      Değer:
        report.stockOut,
    },

    {
      Bilgi: "Transfer",
      Değer:
        report.transfer,
    },
  ];

  const summarySheet =
    XLSX.utils.json_to_sheet(
      summaryData
    );

  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Rapor Özeti"
  );

  // =========================
  // 2️⃣ ÜRÜN STOKLARI
  // =========================

  const productData =
    reportProducts.map(
      (product) => ({
        Ürün: product.name,
        Şube: product.branch,
        Stok: product.stock,
        Kritik: product.critical,

        Durum:
          product.stock <=
          product.critical
            ? "KRİTİK"
            : "NORMAL",
      })
    );

  const productSheet =
    XLSX.utils.json_to_sheet(
      productData
    );

  XLSX.utils.book_append_sheet(
    workbook,
    productSheet,
    "Ürün Stokları"
  );

  // =========================
  // 3️⃣ HAREKET GEÇMİŞİ
  // =========================

  const movementData =
    reportMovements.map(
      (movement) => ({
        Tarih:
          movement.created_at
            ? movement.created_at
                .replace("T", " ")
                .slice(0, 16)
            : "-",

        İşlem:
          movement.type || "-",

        Ürün:
          movement.product_name || "-",

        Miktar:
          movement.amount || "-",

        Nereden:
          movement.from_branch || "-",

        Nereye:
          movement.to_branch || "-",
      })
    );

  const movementSheet =
    XLSX.utils.json_to_sheet(
      movementData
    );

  XLSX.utils.book_append_sheet(
    workbook,
    movementSheet,
    "Hareket Geçmişi"
  );
// =========================
  // 4️⃣ PASTAFLOW AI ANALİZİ
  // =========================

  if (aiAnalysis) {

    const aiData =
      aiAnalysis
        .split("\n")
        .map((line) => ({
          "PastaFlow AI Analizi": line
        }));

    const aiSheet =
      XLSX.utils.json_to_sheet(
        aiData
      );

    // Sütun genişliği
    aiSheet["!cols"] = [
      { wch: 100 }
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      aiSheet,
      "AI Analizi"
    );

  }
  // =========================
  // EXCEL DOSYASINI OLUŞTUR
  // =========================

  const excelBuffer =
    XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

  const data = new Blob(
    [excelBuffer],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
  );

  saveAs(
    data,
    "PastaFlow-Rapor.xlsx"
  );
};
  return (
    <div style={{ padding: "30px" }}>
      <h1>📊 Raporlar</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: "15px",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
      <div className="card">
  <h3>📦 Toplam Ürün</h3>
  <h2>
    {report
      ? report.totalProducts
      : products.length}
  </h2>
</div>

<div className="card">
  <h3>⚠️ Kritik</h3>
  <h2>
    {report
      ? report.criticalProducts
      : products.filter(
          (p) =>
            Number(p.critical || 0) > 0 &&
            Number(p.stock || 0) <=
              Number(p.critical || 0)
        ).length}
  </h2>
</div>

<div className="card">
  <h3>📥 Giriş</h3>
  <h2>
    {report
      ? report.stockIn
      : movements.filter(
          (m) =>
            m.type === "STOK GİRİŞİ"
        ).length}
  </h2>
</div>

<div className="card">
  <h3>📤 Çıkış</h3>
  <h2>
    {report
      ? report.stockOut
      : movements.filter(
          (m) =>
            m.type === "STOK ÇIKIŞI"
        ).length}
  </h2>
</div>

<div className="card">
  <h3>🚚 Transfer</h3>
  <h2>
    {report
      ? report.transfer
      : movements.filter(
          (m) =>
            m.type === "TRANSFER"
        ).length}
  </h2>
</div>
      </div>

      <h2>Filtreler</h2>

      <select
  value={branch}
  onChange={(e) => setBranch(e.target.value)}
  style={{
    padding: "10px",
    marginRight: "15px",
  }}
>

  {currentUser?.role === "YONETICI" ? (

    <>
      {/* TÜM ŞUBELER */}
      <option value="">
        Tüm Şubeler
      </option>

      {/* AKTİF ŞUBELER */}
      {branches.map((branchName) => (
        <option
          key={branchName}
          value={branchName}
        >
          {branchName}
        </option>
      ))}
    </>

  ) : (

    currentUser?.branch && (
      <option
        value={currentUser.branch}
      >
        {currentUser.branch}
      </option>
    )

  )}

</select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={{ padding: "10px", marginRight: "15px" }}
      />

      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={{ padding: "10px" }}
      />

      <br />
      <br />

      <button
        onClick={createReport}
        style={{
          padding: "12px 25px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        📊 Rapor Oluştur
      </button>
      <button
  onClick={generateAIAnalysis}
  disabled={aiLoading}
  style={{
    padding: "12px 25px",
    background: "#7c3aed",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: aiLoading
      ? "not-allowed"
      : "pointer",
    marginLeft: "10px",
    fontWeight: "bold",
  }}
>
  {aiLoading
    ? "🤖 Analiz Ediliyor..."
    : "🤖 PastaFlow AI Analiz"}
</button>
<button
  onClick={exportPDF}
  style={{
    padding: "12px 25px",
    background: "#16a34a",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  📄 PDF İndir
</button>
<button
  onClick={exportExcel}
  style={{
    padding: "12px 25px",
    background: "#15803d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: "10px",
  }}
>
  📗 Excel'e Aktar
</button>
{aiAnalysis && (
  <div
    style={{
      marginTop: "30px",
      background: "#f5f3ff",
      border: "1px solid #c4b5fd",
      borderRadius: "12px",
      padding: "25px",
      boxShadow:
        "0 3px 10px rgba(0,0,0,0.08)",
    }}
  >

    <h2
      style={{
        marginTop: 0,
        color: "#6d28d9",
      }}
    >
      🤖 PastaFlow AI Analiz
    </h2>

    <pre
      style={{
        whiteSpace: "pre-wrap",
        fontFamily: "Arial, sans-serif",
        fontSize: "15px",
        lineHeight: "1.8",
        color: "#374151",
        margin: 0,
      }}
    >
      {aiAnalysis}
    </pre>

  </div>
)}
      {report && (
        <div
          style={{
            marginTop: "35px",
            background: "#f8fafc",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            padding: "25px",
          }}
        >
          <h2>📋 Rapor Sonucu</h2>

          <p><strong>🏪 Şube:</strong> {branch || "Tüm Şubeler"}</p>
          <p><strong>📦 Toplam Ürün:</strong> {report.totalProducts}</p>
          <p><strong>📈 Toplam Stok:</strong> {report.totalStock}</p>
          <p><strong>⚠ Kritik Ürün:</strong> {report.criticalProducts}</p>
          <p><strong>📥 Stok Girişi:</strong> {report.stockIn}</p>
          <p><strong>📤 Stok Çıkışı:</strong> {report.stockOut}</p>
          <p><strong>🚚 Transfer:</strong> {report.transfer}</p>
        </div>
      )}
      {report && reportProducts.length > 0 && (
  <div
  
    style={{
      marginTop: "30px",
      background: "#ffffff",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      padding: "25px",
    }}
  >
    <h2>📦 Ürün Stok Detayı</h2>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "15px",
      }}
    >
      <thead>
        <tr>
          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Ürün
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Şube
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Stok
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Kritik
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Durum
          </th>
        </tr>
      </thead>

      <tbody>
        {reportProducts.map((product) => (
          <tr key={product.id}>
            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {product.name}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {product.branch}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {product.stock}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {product.critical}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {product.stock <= product.critical
                ? "⚠️ KRİTİK"
                : "✅ Normal"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
{report && reportMovements.length > 0 && (
  <div
    style={{
      marginTop: "30px",
      background: "#ffffff",
      border: "1px solid #d1d5db",
      borderRadius: "10px",
      padding: "25px",
    }}
  >
    <h2>🔄 Hareket Geçmişi</h2>

    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "15px",
      }}
    >
      <thead>
        <tr>
          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Tarih
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            İşlem
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Ürün
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Miktar
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Nereden
          </th>

          <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            Nereye
          </th>
        </tr>
      </thead>

      <tbody>
        {reportMovements.map((movement) => (
          <tr key={movement.id}>
            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {movement.created_at
                ? movement.created_at.replace("T", " ").slice(0, 16)
                : "-"}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {movement.type}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {movement.product_name || "-"}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {movement.amount || "-"}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {movement.from_branch || "-"}
            </td>

            <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              {movement.to_branch || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
    </div>
  );
}

export default Reports;