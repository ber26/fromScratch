const { expect } = require("chai");


describe('Token contract', () => {
    let Token, token, owner, addr1, addr2;

    beforeEach (async () => {
        Token = await ethers.getContractFactory('MyToken');
        token = await Token.deploy('MyToken', 'MYT', 8, 1000);
        [owner, addr1, addr2, _] = await ethers.getSigners();
    });

    describe('Deployment', () => {
        it('Should set the right owner', async () => {
            expect(await token.owner()).to.equal(owner.address);
        });

        it('Should assign the total supply of tokens to the owner', async () =>
        {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        });
    });
    describe('Transactions', () => {
        it('Should transfer tokens between accounts', async () => {
            await token.transfer(addr1.address, 50);
            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            await token.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
        it('Should not transfer tokens to same address', async () => {
            const initialOwnerBalance = await token.balanceOf(owner.address);

            await expect (token.connect(owner).transfer(owner.address, 1)).to.be.revertedWith('You cannot transfer to same wallet!');

            expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });

        it('Should fail if sender doesnt have enough tokens', async () => {
            const initialOwnerBalance = await token.balanceOf(owner.address);

            await expect (token.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith('Insufficient Balance!');

            expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });
        it('Should update balances after transfers', async () => {
            const initialOwnerBalance = await token.balanceOf(owner.address);

            await token.transfer(addr1.address, 100);
            await token.transfer(addr2.address, 50);

            const finalOwnerBalance = await token.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance - 150);

            const addr1Balance = await token.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await token.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
    });
    describe('Approval', () => {    
        it ('Should add a new approve pair and set allowance', async () => {
            await token.connect(addr1).approve(addr2.address, 10);

            expect(await token.allowance(addr1.address, addr2.address)).to.equal(10);
        });
        it('Should not transfer tokens to same address', async () => {
            await expect (token.connect(addr1).approve(addr1.address, 10)).to.be.revertedWith('Cannot Approve Same Addresses!');
        });

    });

    describe('TransferFrom, Approval and Allowance', () => {
        it ('Should transfer from addr1 to addr2 with approval', async () => {
            await token.transfer(addr1.address, 100);

            await token.connect(addr1).approve(addr2.address, 100);
                
            await token.connect(addr2).transferFrom(addr1.address, addr2.address, 50);

            expect(await token.balanceOf(addr1.address)).to.equal(50);
            expect(await token.balanceOf(addr2.address)).to.equal(50);

        });    
        
        it('Should not transfer more tokens than approved', async () => {
            await token.transfer(addr1.address, 200);
            
            await token.connect(addr1).approve(addr2.address, 0);

            await expect (token.connect(addr2).transferFrom(addr1.address, addr2.address, 150)).to.be.revertedWith('Allowance amount is too low!');

        });
        it('Should decrease allowance on each transaction', async () => {
            await token.transfer(addr1.address, 100);
            await token.connect(addr1).approve(addr2.address, 50);

            const initialAllowance = await token.allowance(addr1.address, addr2.address);

            await token.connect(addr2).transferFrom(addr1.address, addr2.address, 40);

            const finalAllowance = await token.allowance(addr1.address, addr2.address);

            expect (finalAllowance).to.equal(initialAllowance - 40);

        });
    });


    describe('TimeLock', () => {
        it('Should add and display (total) locked tokens', async () => {

            await token.reserve(addr1.address, 100, 86400);

            const finalLocked = await token.claimable(addr1.address);

            expect (finalLocked).to.equal(100);

            const totalLocked = await token.lockedSupply();

            expect (totalLocked).to.equal(100);
        });
    });
    describe('Claim', () => {
        it('Should claim balance from owner to addr1', async () => {
            await token.reserve(addr1.address, 150, 0);

            const InitialBalance = await token.balanceOf(addr1.address);

            await token.connect(addr1).claim();

            const FinalBalance = await token.balanceOf(addr1.address);
            
            expect (FinalBalance).to.equal(InitialBalance + 150);
        });
        it('Should not claim balance from owner to addr1', async () => {
            await token.reserve(addr1.address, 150, 2000);

            await expect (token.connect(addr1).claim()).to.be.revertedWith('Lock period is not over yet!');
        });

    });

    describe('Claim V2', () => {
        it('ADDR1 reserves for owner and owner successfully claims', async () => {
            const ownerBalancePreReserve = await token.balanceOf(owner.address);
            
            await token.transfer(addr1.address, 500);

            const addr1BalancePreReserve = await token.balanceOf(addr1.address);
            
            await token.connect(addr1).reserve(owner.address, 400, 0);

            const addr1BalancePostReserve = await token.balanceOf(addr1.address);
            const ownerBalancePostReserve = await token.balanceOf(owner.address);
            
            await token.claim();
 
            expect (addr1BalancePostReserve).to.equal(addr1BalancePreReserve - 400);
            expect (ownerBalancePostReserve).to.equal(ownerBalancePreReserve - addr1BalancePostReserve);
        });

        it('Owner is rejected from sending locked tokens', async () => {
            await token.transfer(addr1.address, 500);

            await token.connect(addr1).reserve(addr2.address, 500, 86400);

            const ownerTotalBalance = await token.balanceOf(owner.address);

            await expect (token.transfer(addr1.address, ownerTotalBalance)).to.be.revertedWith('Balance unavailable!');
        });
    });


});