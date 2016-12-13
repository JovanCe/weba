/**
 * Created by JovanCe on 11/28/16.
 */

define(["CPU", "MemoryManager"], function(CPU, MM) {
    describe("CPU", function() {
        beforeEach(function() {
            CPU.reset();
            MM.reset();
        });

        it('should ensure the CPU is in the STOP state', function() {
            expect(CPU._stop).to.equal(true);
        });
        describe("_step()", function() {
            describe("when t is not defined", function() {
                it("should be equal to m*4", function() {
                    CPU._step(1);
                    expect(CPU._reg.M).to.equal(1);
                    expect(CPU._reg.T).to.equal(4);
                });
            });
            describe("when t is defined", function() {
                it("should be equal to provided value", function() {
                    CPU._step(1, 3);
                    expect(CPU._reg.M).to.equal(1);
                    expect(CPU._reg.T).to.equal(3);
                });
            });
            it("should also advance global clocks", function() {
                CPU._step(1, 3);
                CPU._step(2, 5);
                expect(CPU._clock.M).to.equal(3);
                expect(CPU._clock.T).to.equal(8);
            });
        });
        describe("_getFlag()", function() {
            describe("get zero flag", function() {
                it("should get current flag value", function() {
                    CPU._setFlag(CPU._FLAG_ZERO, true);
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
            describe("get substract flag", function() {
                it("should get current flag value", function() {
                    CPU._setFlag(CPU._FLAG_SUBTRACT, true);
                    expect(CPU._getFlag(CPU._FLAG_SUBTRACT)).to.equal(1);
                });
            });
            describe("get half-carry flag", function() {
                it("should get current flag value", function() {
                    CPU._setFlag(CPU._FLAG_HALF_CARRY, true);
                    expect(CPU._getFlag(CPU._FLAG_HALF_CARRY)).to.equal(1);
                });
            });
            describe("get carry flag", function() {
                it("should get current flag value", function() {
                    CPU._setFlag(CPU._FLAG_CARRY, true);
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(1);
                });
            });
        });
        describe("_resetZeroFlag()", function() {
            it("should should set the zero flag to 0", function() {
                CPU._setFlag(CPU._FLAG_ZERO, false);
                expect(CPU._reg.F & 0x80).to.equal(0);
            });
        });
        describe("_setZeroFlag()", function() {
            it("should set the zero flag to 1", function() {
                CPU._setFlag(CPU._FLAG_ZERO, true);
                expect((CPU._reg.F & 0x80) >> 7).to.equal(1);
            });
        });
        describe("_resetSubstractFlag()", function() {
            it("should set the substract flag to 0", function() {
                CPU._setFlag(CPU._FLAG_SUBTRACT, false);
                expect(CPU._reg.F & 0x40).to.equal(0);
            });
        });
        describe("_setSubstractFlag()", function() {
            it("should set the substract flag to 1", function() {
                CPU._setFlag(CPU._FLAG_SUBTRACT, true);
                expect((CPU._reg.F & 0x40) >> 6).to.equal(1);
            });
        });
        describe("_resetHalfCarryFlag()", function() {
            it("should set the half-carry flag to 0", function() {
                CPU._setFlag(CPU._FLAG_HALF_CARRY, false);
                expect(CPU._reg.F & 0x20).to.equal(0);
            });
        });
        describe("_setHalfCarryFlag()", function() {
            it("should set the half-carry flag to 1", function() {
                CPU._setFlag(CPU._FLAG_HALF_CARRY, true);
                expect((CPU._reg.F & 0x20) >> 5).to.equal(1);
            });
        });
        describe("_resetCarryFlag()", function() {
            it("should set the carry flag to 0", function() {
                CPU._setFlag(CPU._FLAG_CARRY, false);
                expect(CPU._reg.F & 0x10).to.equal(0);
            });
        });
        describe("_setCarryFlag()", function() {
            it("should set the carry flag to 1", function() {
                CPU._setFlag(CPU._FLAG_CARRY, true);
                expect((CPU._reg.F & 0x10) >> 4).to.equal(1);
            });
        });

        describe("NOP", function() {
            it("should do nothing but advance the clock by 1 machine cycle", function() {
                CPU.NOP();
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            })
        });
        describe("HALT", function() {
            it("should put the CPU in HALT state (pause)", function() {
                CPU.HALT();
                expect(CPU._halt).to.equal(true);
            })
        });

        describe("LDr", function() {
            it("should copy value from the register in the first argument to the register in the second" +
                "and advance the clock by 1 machine cycle", function() {
                CPU._reg.A=5;
                CPU._LDr("A", "B");
                expect(CPU._reg.B).to.equal(5);
                expect(CPU._reg.M).to.equal(1);
            });
        });
        describe("LDrn", function() {
            it("should load an immediate byte value into the provided register" +
                "and advance the clock by 2 machine cycles", function() {
                CPU._reg.PC=5;
                MM.writeByte(CPU._reg.PC, 1);
                CPU._LDrn("A");
                expect(CPU._reg.A).to.equal(1);
                expect(CPU._reg.M).to.equal(2);
            });
        });
        describe("LDrn16", function() {
            it("should load an immediate word value into two provided 8-bit registers, advance the PC by 2" +
                "and advance the clock by 3 machine cycles", function() {
                CPU._reg.PC=5;
                MM.writeByte(CPU._reg.PC, 1);
                MM.writeByte(CPU._reg.PC+1, 2);
                CPU._LDrn16("A", "B");
                expect(CPU._reg.A).to.equal(1);
                expect(CPU._reg.B).to.equal(2);
                expect(CPU._reg.PC).to.equal(7);
                expect(CPU._reg.M).to.equal(3);
            });
        });
        describe("LDr16n16", function() {
            it("should load an immediate word value into the provided 16-bit register, advance the PC by 2" +
                "and advance the clock by 3 machine cycles", function() {
                CPU._reg.PC=5;
                MM.writeByte(CPU._reg.PC, 1);
                MM.writeByte(CPU._reg.PC+1, 2);
                CPU._LDr16n16("SP");
                // CPU is little endian and memory works with binaries, not BCDs, that's why the expected result is
                // not 21
                expect(CPU._reg.SP).to.equal(513);
                expect(CPU._reg.PC).to.equal(7);
                expect(CPU._reg.M).to.equal(3);
            });
        });
        describe("LDrmm", function() {
            it("should load the value from the address provided by first two registers into the third one," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                MM.writeByte(258, 1);
                CPU._reg.H=1;
                CPU._reg.L=2;
                CPU.LDrmAHL();
                expect(CPU._reg.A).to.equal(1);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("LDmmr", function() {
            it("should put the value from the first register to the address provided by the second two," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.A = 5;
                CPU._reg.H=1;
                CPU._reg.L=2;
                CPU._LDmmr("A", "H", "L");
                expect(MM.readByte(258)).to.equal(5);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("LDmn", function() {
            it("should put the immediate byte value into the the address provided by two registers in params," +
                "and advance the clocks by 2 machine cycle and 12 cpu cycles respectively", function() {
                CPU._reg.PC = 5;
                MM.writeByte(CPU._reg.PC, 81);
                CPU._reg.H=1;
                CPU._reg.L=2;
                CPU._LDmn("H", "L");
                expect(MM.readByte(258)).to.equal(81);
                expect(CPU._reg.M).to.equal(2);
                expect(CPU._reg.T).to.equal(12);
            });
        });
        describe("LDa16r", function() {
            it("should put the byte value in the register to the immediate address value, advance the PC by 2" +
                "and advance the clocks by 3 machine cycle and 16 cpu cycles respectively", function() {
                CPU._reg.PC = 5;
                MM.writeByte(CPU._reg.PC, 2);
                MM.writeByte(CPU._reg.PC+1, 1);
                CPU._reg.A = 10;
                CPU._LDa16r("A");
                expect(MM.readByte(258)).to.equal(10);
                expect(CPU._reg.PC).to.equal(7);
                expect(CPU._reg.M).to.equal(3);
                expect(CPU._reg.T).to.equal(16);
            });
        });
        describe("LDa16r16", function() {
            it("should put the word value in the 16-bit register to the immediate address value, advance the PC by 2" +
                "and advance the clocks by 3 machine cycle and 20 cpu cycles respectively", function() {
                CPU._reg.PC = 5;
                MM.writeByte(CPU._reg.PC, 2);
                MM.writeByte(CPU._reg.PC+1, 1);
                CPU._reg.SP = 512;
                CPU._LDa16r16("SP");
                expect(MM.readWord(258)).to.equal(512);
                expect(CPU._reg.PC).to.equal(7);
                expect(CPU._reg.M).to.equal(3);
                expect(CPU._reg.T).to.equal(20);
            });
        });
        describe("LDra16", function() {
            it("should load the value in the immediate address, put it in the provided register, advance the PC by 2" +
                "and advance the clocks by 3 machine cycle and 16 cpu cycles respectively", function() {
                CPU._reg.PC = 5;
                MM.writeByte(CPU._reg.PC, 2);
                MM.writeByte(CPU._reg.PC+1, 1);
                MM.writeByte(MM.readWord(CPU._reg.PC), 8);
                CPU._LDra16("A");
                expect(CPU._reg.A).to.equal(8);
                expect(CPU._reg.PC).to.equal(7);
                expect(CPU._reg.M).to.equal(3);
                expect(CPU._reg.T).to.equal(16);
            });
        });
        describe("LDar", function() {
            it("should put the value from the register into the FF00 + immediate offset address, advance the PC by 1" +
                "and advance the clocks by 2 machine cycle and 12 cpu cycles respectively", function() {
                CPU._reg.PC = 5;
                MM.writeByte(CPU._reg.PC, 2);
                CPU._reg.A = 1;
                CPU._LDar("A");
                expect(MM.readByte(0xFF00 + 2)).to.equal(1);
                expect(CPU._reg.PC).to.equal(6);
                expect(CPU._reg.M).to.equal(2);
                expect(CPU._reg.T).to.equal(12);
            });
        });
        describe("LDra", function() {
            it("should load the value from the FF00 + immediate offset address into the provided register," +
                "and advance the clocks by 2 machine cycle and 12 cpu cycles respectively", function() {
                CPU._reg.PC = 5;
                MM.writeByte(CPU._reg.PC, 2);
                MM.writeByte(0xFF00 + 2, 1);
                CPU._LDra("A");
                expect(CPU._reg.A).to.equal(1);
                expect(CPU._reg.M).to.equal(2);
                expect(CPU._reg.T).to.equal(12);
            });
        });
        describe("LDmr", function() {
            it("should put the value from the first register into the FF00 + offset provided in the second register address," +
                "and advance the clocks by 2 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.C = 5;
                CPU._reg.A = 1;
                CPU._LDmr("A", "C");
                expect(MM.readByte(0xFF00 + 5)).to.equal(1);
                expect(CPU._reg.M).to.equal(2);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("LDrm", function() {
            it("should load the value from the FF00 + offset provided in the second register address into the first register," +
                "and advance the clocks by 2 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.C = 5;
                MM.writeByte(0xFF00 + 5, 13);
                CPU._LDrm("C", "A");
                expect(CPU._reg.A).to.equal(13);
                expect(CPU._reg.M).to.equal(2);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("LDr16rr", function() {
            it("should load the value from the first two 8-bit registers to the third 16-bit register," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.H = 2;
                CPU._reg.L = 5;
                CPU._LDr16rr("H", "L", "SP");
                expect(CPU._reg.SP).to.equal(517);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("LDrrr16n", function() {
            function execute(regVal, offsetVal) {
                CPU._reg.SP=regVal;
                CPU._reg.PC=5;
                MM.writeByte(CPU._reg.PC, offsetVal);
                CPU._LDrrr16n("SP", "H", "L");
            }
            it("should load the value from the first 16-bit register added with the immediate signed byte offset, " +
                "into the second two 8-bit registers, set carry and half-carry flags accordingly" +
                "and advance the clocks by 2 machine cycle and 12 cpu cycles respectively", function() {
                execute(1000, 2);
                expect(CPU._reg.H).to.equal(3);
                expect(CPU._reg.L).to.equal(234);
                expect(CPU._reg.M).to.equal(2);
                expect(CPU._reg.T).to.equal(12);
            });
            describe("when the offset is negative", function() {
                it("should convert the offset from 2-complement representation", function() {
                    execute(1000, 254);
                    expect(CPU._reg.H).to.equal(3);
                    expect(CPU._reg.L).to.equal(230);
                });
            });
            describe("when there's a low nibble overflow", function() {
                it("should set the half-carry flag", function() {
                    execute(1000, -2);
                    expect(CPU._reg.H).to.equal(3);
                    expect(CPU._reg.L).to.equal(230);
                    expect((CPU._reg.F & 0x20) >> 5).to.equal(1);
                });
            });
            describe("when there's an overflow", function() {
                it("should set the carry flag", function() {
                    execute(65535, 2);
                    expect(CPU._reg.H).to.equal(0);
                    expect(CPU._reg.L).to.equal(1);
                    expect((CPU._reg.F & 0x10) >> 4).to.equal(1);
                });
            });

        });
        describe("POPrr", function() {
            it("should pop two byte values from the stack, put them into provided registers, increasing the SP register twice in the meantime, " +
                "and advance the clocks by 1 machine cycle and 16 cpu cycles respectively", function() {
                CPU._reg.SP = 9;
                MM.writeByte(10, 5);
                MM.writeByte(9, 6);
                CPU._POPrr("D", "E");
                expect(CPU._reg.D).to.equal(5);
                expect(CPU._reg.E).to.equal(6);
                expect(CPU._reg.SP).to.equal(11);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(12);
            });
        });
        describe("PUSHrr", function() {
           it("should push provided registers to the stack, decreasing the SP register twice in the meantime, " +
               "and advance the clocks by 1 machine cycle and 16 cpu cycles respectively", function() {
               CPU._reg.SP = 10;
               CPU._reg.D = 5;
               CPU._reg.E = 6;
               CPU._PUSHrr("D", "E");
               var d = MM.readByte(9);
               var e = MM.readByte(8);
               expect(d).to.equal(CPU._reg.D);
               expect(e).to.equal(CPU._reg.E);
               expect(CPU._reg.SP).to.equal(8);
               expect(CPU._reg.M).to.equal(1);
               expect(CPU._reg.T).to.equal(16);
           });
        });
        describe("PUSHrr and POPrr", function() {
            it("", function() {
                CPU._reg.SP = 10;
                CPU._reg.D = 5;
                CPU._reg.E = 6;
                CPU._PUSHrr("D", "E");
                CPU._POPrr("D", "E")
                expect(CPU._reg.D).to.equal(5);
                expect(CPU._reg.E).to.equal(6);
                expect(CPU._reg.SP).to.equal(10);
                expect(CPU._clock.M).to.equal(2);
                expect(CPU._clock.T).to.equal(28);
            });
        });
        describe("ADDrr", function() {
            it("should add the contents of the two registers and store them in the first one, " +
                "and advance the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A=5;
                CPU._reg.B=10;
                CPU._ADDrr("A", "B");
                expect(CPU._reg.A).to.equal(15);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            it("should also reset the substract flag", function() {
                CPU._setFlag(CPU._FLAG_SUBTRACT, true);
                CPU._reg.A=5;
                CPU._reg.B=10;
                CPU._ADDrr("A", "B");
                expect(CPU._getFlag(CPU._FLAG_SUBTRACT)).to.equal(0);
            });
            describe("when the result is zero", function() {
                it("should set the zero flag", function() {
                    CPU._reg.A = 5;
                    CPU._reg.B = -5;
                    CPU._ADDrr("A", "B");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
            describe("when there's a low nibble overflow", function() {
                it("should set the half-carry flag", function() {
                    CPU._reg.A = 0x0F;
                    CPU._reg.B = 0xAB;
                    CPU._ADDrr("A", "B");
                    expect(CPU._getFlag(CPU._FLAG_HALF_CARRY)).to.equal(1);
                });
            });
            describe("when there's an overflow", function() {
                it("should set the carry flag", function() {
                    CPU._reg.A = 0xFF;
                    CPU._reg.B = 0xAB;
                    CPU._ADDrr("A", "B");
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(1);
                });
            });
        });
        describe("ADDrmm", function() {
            it("should behave exactly like ADDrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.A=10;
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 5;
                CPU.LDmrHLB();
                CPU._ADDrmm("H", "L", "A");
                expect(CPU._reg.A).to.equal(15);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("ADCrr", function() {
            it("should behave exactly like ADDrr but take into account the carry flag", function() {
                CPU._reg.A=5;
                CPU._reg.B=10;
                CPU._ADDrr("A", "B", true);
                expect(CPU._reg.A).to.equal(15);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            describe("when the carry flag is set before", function() {
                it("should add 1 to the final result and reset the carry flag", function() {
                    CPU._setFlag(CPU._FLAG_CARRY, true);
                    CPU._reg.A = 10;
                    CPU._reg.B = 11;
                    CPU._ADDrr("A", "B", true);
                    expect(CPU._reg.A).to.equal(22);
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(0);
                });
            });
            describe("when the carry flag is set before and the result is 255", function() {
            it("should set the carry flag because of overflow", function() {
                    CPU._setFlag(CPU._FLAG_CARRY, true);
                    CPU._reg.A = 200;
                    CPU._reg.B = 55;
                    CPU._ADDrr("A", "B", true);
                    expect(CPU._reg.A).to.equal(0);
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(1);
                });
            });
        });
        describe("ADCrmm", function() {
            it("should behave exactly like ADCrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.A=10;
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 5;
                CPU.LDmrHLB();
                CPU._setFlag(CPU._FLAG_CARRY, true);
                CPU._ADDrmm("H", "L", "A", true);
                expect(CPU._reg.A).to.equal(16);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("ADDrrrr", function() {
            it("should behave exactly like ADDrr but treats the  operands as single, 16-bit registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 1;
                CPU._reg.C = 5;
                CPU._ADDrrrr("H", "L", "B", "C");
                expect(CPU._reg.H).to.equal(6);
                expect(CPU._reg.L).to.equal(11);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("SUBrr", function() {
            it("should substract the contents of the register A and the given and store them in A, " +
                "and advance the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A=20;
                CPU._reg.B=10;
                CPU._SUBrr("B");
                expect(CPU._reg.A).to.equal(10);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            it("should also set the substract flag", function() {
                CPU._setFlag(CPU._FLAG_SUBTRACT, true);
                CPU._reg.A=15;
                CPU._reg.B=10;
                CPU._SUBrr("B");
                expect(CPU._getFlag(CPU._FLAG_SUBTRACT)).to.equal(1);
            });
            describe("when the result is zero", function() {
                it("should set the zero flag", function() {
                    CPU._reg.A = 5;
                    CPU._reg.B = 5;
                    CPU._SUBrr("B");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
            describe("when there's a low nibble underflow", function() {
                it("should set the half-carry flag", function() {
                    CPU._reg.A = 0xFA;
                    CPU._reg.B = 0xAB;
                    CPU._SUBrr("B");
                    expect(CPU._getFlag(CPU._FLAG_HALF_CARRY)).to.equal(1);
                });
            });
            describe("when there's an underflow", function() {
                it("should set the carry flag", function() {
                    CPU._reg.A = 0xAB;
                    CPU._reg.B = 0xFF;
                    CPU._SUBrr("B");
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(1);
                });
            });
        });
        describe("SUBrmm", function() {
            it("should behave exactly like SUBrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.A=20;
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 10;
                CPU.LDmrHLB();
                CPU._SUBrmm("H", "L");
                expect(CPU._reg.A).to.equal(10);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("SBCrr", function() {
            it("should behave exactly like SUBrr but take into account the carry flag", function() {
                CPU._reg.A=20;
                CPU._reg.B=10;
                CPU._SUBrr("B", true);
                expect(CPU._reg.A).to.equal(10);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            describe("when the carry flag is set before", function() {
                it("should substract 1 from the final result and reset the carry flag", function() {
                    CPU._setFlag(CPU._FLAG_CARRY, true);
                    CPU._reg.A = 15;
                    CPU._reg.B = 11;
                    CPU._SUBrr("B", true);
                    expect(CPU._reg.A).to.equal(3);
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(0);
                });
            });
            describe("when the carry flag is set before and the result is zero", function() {
                it("should set the carry flag because of underflow", function() {
                    CPU._setFlag(CPU._FLAG_CARRY, true);
                    CPU._reg.A = 15;
                    CPU._reg.B = 15;
                    CPU._SUBrr("B", true);
                    expect(CPU._reg.A).to.equal(255);
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(1);
                });
            });
        });
        describe("SBCrmm", function() {
            it("should behave exactly like SBCrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.A=20;
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 10;
                CPU.LDmrHLB();
                CPU._setFlag(CPU._FLAG_CARRY, true);
                CPU._SUBrmm("H", "L", true);
                expect(CPU._reg.A).to.equal(9);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("ANDrr", function() {
            it("should perform a bitwise and between the A register and the given register " +
                "and store the result in A. It should also advance " +
                "the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A = 2;
                CPU._reg.B = 3;
                CPU._ANDrr("B");
                expect(CPU._reg.A).to.equal(2);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            describe("when the result equals zero", function() {
                it("should set the zero flag", function() {
                    CPU._reg.A = 4;
                    CPU._reg.B = 3;
                    CPU._ANDrr("B");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
        });
        describe("ANDrmm", function() {
            it("should behave like ANDrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 3;
                CPU.LDmrHLB();
                CPU._reg.A = 2;
                CPU._ANDrmm("H", "L");
                expect(CPU._reg.A).to.equal(2);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("XORrr", function() {
            it("should perform a bitwise xor between the A register and the given register " +
                "and store the result in A. It should also advance " +
                "the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A = 7;
                CPU._reg.B = 3;
                CPU._XORrr("B");
                expect(CPU._reg.A).to.equal(4);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            describe("when the result equals zero", function() {
                it("should set the zero flag", function() {
                    CPU._reg.A = 7;
                    CPU._reg.B = 7;
                    CPU._XORrr("B");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
        });
        describe("XORrmm", function() {
            it("should behave like XORrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 4;
                CPU.LDmrHLB();
                CPU._reg.A = 7;
                CPU._XORrmm("H", "L");
                expect(CPU._reg.A).to.equal(3);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("ORrr", function() {
            it("should perform a bitwise or between the A register and the given register " +
                "and store the result in A. It should also advance " +
                "the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A = 4;
                CPU._reg.B = 3;
                CPU._ORrr("B");
                expect(CPU._reg.A).to.equal(7);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            describe("when the result equals zero", function() {
                it("should set the zero flag", function() {
                    CPU._reg.A = 0;
                    CPU._reg.B = 0;
                    CPU._ORrr("B");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
        });
        describe("ORrmm", function() {
            it("should behave like ORrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 3;
                CPU.LDmrHLB();
                CPU._reg.A = 4;
                CPU._ORrmm("H", "L");
                expect(CPU._reg.A).to.equal(7);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("CPrr", function() {
            it("should compare the contents of the register A and the given and set the zero flag of they're equal, " +
                "and advance the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A=10;
                CPU._reg.B=10;
                CPU._CPrr("B");
                expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            it("should also set the substract flag", function() {
                CPU._setFlag(CPU._FLAG_SUBTRACT, true);
                CPU._reg.A=15;
                CPU._reg.B=10;
                CPU._CPrr("B");
                expect(CPU._getFlag(CPU._FLAG_SUBTRACT)).to.equal(1);
            });
            describe("when the result is not zero", function() {
                it("should reset the zero flag", function() {
                    CPU._reg.A = 12;
                    CPU._reg.B = 5;
                    CPU._CPrr("B");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(0);
                });
            });
            describe("when there's a low nibble underflow", function() {
                it("should set the half-carry flag", function() {
                    CPU._reg.A = 0xFA;
                    CPU._reg.B = 0xAB;
                    CPU._CPrr("B");
                    expect(CPU._getFlag(CPU._FLAG_HALF_CARRY)).to.equal(1);
                });
            });
            describe("when there's an underflow", function() {
                it("should set the carry flag", function() {
                    CPU._reg.A = 0xAB;
                    CPU._reg.B = 0xFF;
                    CPU._CPrr("B");
                    expect(CPU._getFlag(CPU._FLAG_CARRY)).to.equal(1);
                });
            });
        });
        describe("CPrmm", function() {
            it("should behave like CPrr but take the operand from the address stored in provided registers," +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU._reg.B = 10;
                CPU.LDmrHLB();
                CPU._reg.A = 10;
                CPU._CPrmm("H", "L");
                expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
        });
        describe("INCr", function() {
            it("should increment the given register" +
                "and advance the clocks by 1 machine cycle and 4 cpu cycles respectively", function() {
                CPU._reg.A = 10;
                CPU._INCr("A");
                expect(CPU._reg.A).to.equal(11);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(4);
            });
            it("should reset the subtract flag", function() {
                CPU._setFlag(CPU._FLAG_SUBTRACT, true);
                CPU._reg.A = 10;
                CPU._INCr("A");
                expect(CPU._getFlag(CPU._FLAG_SUBTRACT)).to.equal(0);
            });
            describe("when the result is zero", function() {
                it("should set the zero flag", function() {
                    CPU._reg.A = 255;
                    CPU._INCr("A");
                    expect(CPU._getFlag(CPU._FLAG_ZERO)).to.equal(1);
                });
            });
            describe("when there's a low nibble overflow", function() {
                it("should set the half-carry flag", function() {
                    CPU._reg.A = 0xAE;
                    CPU._INCr("A");
                    expect(CPU._getFlag(CPU._FLAG_HALF_CARRY)).to.equal(1);
                });
            });
        });
        describe("INCmm", function() {
            it("should behave like INCr but increment the value on address stored in two provided registers" +
                "and advance the clocks by 1 machine cycle and 12 cpu cycles respectively", function() {
                CPU._reg.A = 10;
                CPU._reg.H = 5;
                CPU._reg.L = 6;
                CPU.LDmrHLA();
                CPU._INCmm("H", "L");
                expect(MM.readByte((CPU._reg.H << 8) + CPU._reg.L)).to.equal(11);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(12);
            });
        });
        describe("INCrr", function() {
            it("should increment provided register pair as if they're a single 16-bit value" +
                "and advance the clocks by 1 machine cycle and 8 cpu cycles respectively", function() {
                CPU._reg.B = 10;
                CPU._reg.C = 5;
                CPU._INCrr("C", "B");
                expect(CPU._reg.C).to.equal(6);
                expect(CPU._reg.B).to.equal(10);
                expect(CPU._reg.M).to.equal(1);
                expect(CPU._reg.T).to.equal(8);
            });
            describe("when there's an overflow", function() {
                it("should increment the second register also (high byte)", function() {
                    CPU._reg.B = 10;
                    CPU._reg.C = 0xFF;
                    CPU._INCrr("C", "B");
                    expect(CPU._reg.C).to.equal(0);
                    expect(CPU._reg.B).to.equal(11);
                });
            });
            describe("when only one argument is provided (16-bit register inc)", function() {
                it("should increment it", function() {
                    CPU._reg.SP = 10;
                    CPU._INCrr("SP");
                    expect(CPU._reg.SP).to.equal(11);
                });
            });
        });
    });


    return {
        name: "CPU tests"
    }
});
