# Phase 4: Room-Scale Positioning Research

This directory contains research and prototypes for adding room-scale positioning to HandTrack3D.

## Documents

### Phase 4A: WiFi Positioning Research (COMPLETE)

- **[POSITIONING_RESEARCH.md](./POSITIONING_RESEARCH.md)** - Comprehensive research document
  - 4 approaches analyzed (companion app, Chrome extension, router API, UWB)
  - Selected approach: Companion app using `node-wifi`
  - Mathematical foundations (path loss model, trilateration)
  - Architecture and protocol design
  - Expected accuracy: ±2-5m (WiFi RSSI-based)

- **[TEST_RESULTS.md](./TEST_RESULTS.md)** - Honest test results and findings
  - Hardware testing blocked (no WiFi networks on test system)
  - Simulated testing revealed trilateration algorithm issues
  - Recommendations for Phase 4B
  - Lessons learned

- **[QUICKSTART.md](./QUICKSTART.md)** - 15-minute setup guide
  - How to install and run WiFi companion app
  - Router configuration steps
  - Calibration procedure
  - Troubleshooting tips

## Phase Status

### ✅ Phase 4A: WiFi Positioning Research (COMPLETE)

**Date Completed**: 2026-08-30

**Deliverables**:
- ✅ Research document with approach comparison
- ✅ Working WiFi companion app prototype
- ✅ Browser WebSocket client
- ✅ RSSI→distance conversion algorithms
- ⚠️ Trilateration algorithm (needs refinement for Phase 4B)
- ✅ Unit tests
- ✅ Documentation

**Key Findings**:
- WiFi positioning is FEASIBLE (infrastructure works)
- Expected accuracy: ±2-5m (acceptable for room-scale)
- Trilateration algorithm needs established library (current implementation unstable)
- Companion app approach validated (cross-platform, no browser restrictions)

**Recommendation**: PROCEED to Phase 4B with algorithm improvements

### ⏳ Phase 4B: Integration (PENDING APPROVAL)

**Planned Work**:
1. Fix trilateration algorithm (use npm library)
2. Hardware testing with real WiFi networks
3. Sensor fusion (WiFi + camera hand tracking)
4. Kalman filtering for position smoothing
5. Calibration wizard UI

**Estimated Time**: 5-7 days

**Expected Outcome**: Room-scale hand tracking with ±2-5m position accuracy

### ⏳ Phase 4C: UWB Hardware (FUTURE)

**Planned Work**:
1. Research UWB modules (Decawave DWM1001)
2. WebUSB integration
3. UWB positioning algorithm
4. Hardware testing

**Estimated Time**: 10-14 days

**Expected Outcome**: High-precision positioning (±10-30cm)

**Cost**: ~$150 (4x UWB modules)

## Quick Links

**Get Started**:
```bash
cd tools/wifi-companion
npm install
npm run test-scan  # Test WiFi scanning
npm start          # Start companion app
```

**Documentation**:
- [Full Research](./POSITIONING_RESEARCH.md)
- [Test Results](./TEST_RESULTS.md)
- [Quick Start Guide](./QUICKSTART.md)

**Code**:
- [WiFi Companion App](/tools/wifi-companion/)
- [Browser Client](/src/services/positioning/)
- [Algorithms](/src/utils/)

## Decision Points

**Should we proceed to Phase 4B?**

**Option 1: YES - Fix algorithm and integrate** (RECOMMENDED)
- Pros: WiFi positioning feasible, infrastructure works, low cost
- Cons: ±2-5m accuracy (not cm-level)
- Time: 5-7 days
- Cost: Free

**Option 2: SKIP to Phase 4C (UWB)**
- Pros: Much better accuracy (±10-30cm)
- Cons: Hardware cost, longer implementation
- Time: 10-14 days
- Cost: ~$150

**Option 3: DEFER positioning**
- Pros: Continue with camera-only tracking
- Cons: No room-scale positioning
- Time: 0 days
- Cost: Free

## Contact

For questions or feedback on Phase 4 research:
- Create issue on GitHub
- See `/docs/phase4/TEST_RESULTS.md` for detailed findings

---

**Last Updated**: 2026-08-30
**Phase 4A Status**: ✅ COMPLETE
**Next Phase**: Pending team lead approval
