# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JS TODO 앱. 빌드 도구 없이 브라우저에서 바로 실행됩니다.

## Running

`index.html`을 브라우저에서 직접 열면 됩니다. 별도의 빌드/설치 과정 없음.

## Architecture

- [index.html](index.html) — 앱 셸. DOM 구조 정의
- [style.css](style.css) — CSS 변수 기반 테마 시스템 (`[data-theme="dark"]`), 별도 JS 없이 다크모드 전환
- [app.js](app.js) — 단일 파일 상태 관리. `todos` 배열이 유일한 state이며 `render()`가 전체 리스트를 매번 재렌더링

### State flow

```
addTodo / toggle / remove
       ↓
   save() → localStorage
       ↓
   render() → DOM 재구성
```

데이터는 `localStorage('todos')`에 JSON으로 저장됩니다.
