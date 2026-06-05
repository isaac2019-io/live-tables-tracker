/** 注入 DB 大厅页面，拦截桌台数据（NoticeCenter + 内存 store 扫描） */
export const DB_LOBBY_CAPTURE_INIT_SCRIPT = String.raw`
(() => {
  if (window.__dbLobbyCapture) return;
  window.__dbLobbyCapture = {
    tables: {},
    events: [],
    sessionExpired: false,
    ready: false,
    error: null,
    hooked: 0,
    storeHits: 0,
  };

  function mergeTableRow(row) {
    if (!row?.tableId) return;
    const key = String(row.tableId);
    const prev = window.__dbLobbyCapture.tables[key] ?? {};
    window.__dbLobbyCapture.tables[key] = {
      tableId: row.tableId,
      tableName: row.tableName ?? prev.tableName,
      physicsTableNo: row.physicsTableNo ?? prev.physicsTableNo,
      gameTypeId: row.gameTypeId ?? prev.gameTypeId,
      gameCasinoId: row.gameCasinoId ?? prev.gameCasinoId,
      tableOpen: row.tableOpen ?? prev.tableOpen,
      gameStatus: row.gameStatus ?? prev.gameStatus,
      openStatus: row.openStatus ?? prev.openStatus,
    };
  }

  function mergeGameTableMap(map) {
    if (!map || typeof map !== "object") return 0;
    let added = 0;
    for (const key of Object.keys(map)) {
      const row = map[key];
      if (row?.tableId) {
        mergeTableRow(row);
        added += 1;
      }
    }
    return added;
  }

  function isNoticeCenter(obj) {
    return (
      obj &&
      typeof obj.sendNotify === "function" &&
      obj.dict &&
      typeof obj.dict === "object"
    );
  }

  function hookSafeParse(obj) {
    if (!obj || typeof obj.safeParse !== "function" || obj.safeParse.__dbHooked) {
      return false;
    }
    const original = obj.safeParse.bind(obj);
    obj.safeParse = (text) => {
      const value = original(text);
      try {
        const res = value?.res ?? value;
        if (res?.gameTableMap) mergeGameTableMap(res.gameTableMap);
        if (value?.gameTableMap) mergeGameTableMap(value.gameTableMap);
        if (Array.isArray(res?.hallGameTable)) {
          for (const row of res.hallGameTable) mergeTableRow(row);
        }
        if (value?.protocolId === 10053 || res?.protocolId === 10053) {
          window.__dbLobbyCapture.events.push({
            id: 10053,
            size: res?.gameTableMap
              ? Object.keys(res.gameTableMap).length
              : 0,
          });
        }
      } catch (error) {
        window.__dbLobbyCapture.error = String(error);
      }
      return value;
    };
    obj.safeParse.__dbHooked = true;
    window.__dbLobbyCapture.hooked += 1;
    return true;
  }

  function hookNoticeCenter(obj) {
    if (!isNoticeCenter(obj) || obj.sendNotify.__dbHooked) return false;
    const original = obj.sendNotify.bind(obj);
    obj.sendNotify = (id, payload) => {
      try {
        const res = payload?.res ?? payload;
        if (res?.gameTableMap) mergeGameTableMap(res.gameTableMap);
        if (id === 10053 || id === "10053") {
          window.__dbLobbyCapture.events.push({
            id,
            size: res?.gameTableMap
              ? Object.keys(res.gameTableMap).length
              : 0,
          });
        }
      } catch (error) {
        window.__dbLobbyCapture.error = String(error);
      }
      return original(id, payload);
    };
    obj.sendNotify.__dbHooked = true;
    window.__dbLobbyCapture.hooked += 1;
    return true;
  }

  function scanForData() {
    const queue = [window];
    const seen = new Set();
    let hooked = 0;
    let storeHits = 0;

    while (queue.length) {
      const current = queue.shift();
      if (!current || typeof current !== "object" || seen.has(current)) continue;
      seen.add(current);

      if (hookNoticeCenter(current)) hooked += 1;
      if (hookSafeParse(current)) hooked += 1;
      if (typeof current.instance === "function") {
        try {
          const inst = current.instance();
          if (hookNoticeCenter(inst)) hooked += 1;
          if (hookSafeParse(inst)) hooked += 1;
        } catch {
          // ignore
        }
      }

      try {
        if (current._gameTableMap) {
          const n = mergeGameTableMap(current._gameTableMap);
          if (n > 0) storeHits += 1;
        }
        if (Array.isArray(current.gameListTableIds)) {
          for (const row of current.gameListTableIds) mergeTableRow(row);
          if (current.gameListTableIds.length > 0) storeHits += 1;
        }
        if (current.NoticeCenter && hookNoticeCenter(current.NoticeCenter)) {
          hooked += 1;
        }
        if (current.CommonUtils && hookSafeParse(current.CommonUtils)) {
          hooked += 1;
        }
      } catch {
        // ignore proxy / sealed objects
      }

      for (const value of Object.values(current)) {
        if (value && typeof value === "object") queue.push(value);
      }
    }

    window.__dbLobbyCapture.hooked = Math.max(
      window.__dbLobbyCapture.hooked,
      hooked,
    );
    window.__dbLobbyCapture.storeHits += storeHits;
    return storeHits;
  }

  window.setInterval(() => {
    scanForData();
    const bodyText = document.body?.innerText ?? "";
    if (bodyText.includes("登录信息已过期") || bodyText.includes("重新登录")) {
      window.__dbLobbyCapture.sessionExpired = true;
    }
    const tableCount = Object.keys(window.__dbLobbyCapture.tables).length;
    if (tableCount >= 5) {
      window.__dbLobbyCapture.ready = true;
    }
  }, 500);
})();
`;

export type RawDbLobbyTable = {
  tableId: number;
  tableName?: string;
  physicsTableNo?: string;
  gameTypeId: number;
  gameCasinoId: number;
  tableOpen?: boolean;
  gameStatus?: number;
  openStatus?: number;
};

export type DbLobbyCaptureState = {
  tables: Record<string, RawDbLobbyTable>;
  events: { id: number | string; size: number }[];
  sessionExpired: boolean;
  ready: boolean;
  error: string | null;
  hooked?: number;
  storeHits?: number;
};
