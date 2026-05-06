use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("EscrwLy11111111111111111111111111111111111");

#[program]
pub mod escrowly_program {
    use super::*;

    pub fn initialize_deal(
        ctx: Context<InitializeDeal>,
        amount_lamports: u64,
        description: String,
    ) -> Result<()> {
        require!(amount_lamports > 0, EscrowError::InvalidAmount);
        require!(description.len() <= 256, EscrowError::DescriptionTooLong);

        let escrow = &mut ctx.accounts.escrow_deal;
        escrow.buyer = ctx.accounts.buyer.key();
        escrow.seller = ctx.accounts.seller.key();
        escrow.amount_lamports = amount_lamports;
        escrow.status = EscrowStatus::Funded as u8;
        escrow.created_at = Clock::get()?.unix_timestamp;
        escrow.completed_at = 0;
        escrow.description = description;
        escrow.bump = ctx.bumps.escrow_deal;

        // Transfer buyer funds into PDA vault.
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.escrow_deal.to_account_info(),
            },
        );
        transfer(transfer_ctx, amount_lamports)?;

        Ok(())
    }

    pub fn request_cancellation(ctx: Context<RequestCancellation>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_deal;
        require!(
            escrow.status == EscrowStatus::Funded as u8,
            EscrowError::InvalidStatusTransition
        );
        require_keys_eq!(
            escrow.seller,
            ctx.accounts.seller.key(),
            EscrowError::Unauthorized
        );
        escrow.status = EscrowStatus::CancelRequested as u8;
        Ok(())
    }

    pub fn release_payment(ctx: Context<SettleDeal>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_deal;
        require!(
            escrow.status == EscrowStatus::Funded as u8,
            EscrowError::InvalidStatusTransition
        );
        require_keys_eq!(
            escrow.buyer,
            ctx.accounts.buyer.key(),
            EscrowError::Unauthorized
        );
        settle_from_vault(
            escrow,
            ctx.accounts.escrow_deal.to_account_info(),
            ctx.accounts.seller.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        )?;
        escrow.status = EscrowStatus::Released as u8;
        escrow.completed_at = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn approve_refund(ctx: Context<ApproveRefund>) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow_deal;
        require!(
            escrow.status == EscrowStatus::CancelRequested as u8,
            EscrowError::InvalidStatusTransition
        );
        require_keys_eq!(
            escrow.buyer,
            ctx.accounts.buyer.key(),
            EscrowError::Unauthorized
        );
        settle_from_vault(
            escrow,
            ctx.accounts.escrow_deal.to_account_info(),
            ctx.accounts.buyer.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        )?;
        escrow.status = EscrowStatus::Refunded as u8;
        escrow.completed_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

fn settle_from_vault<'info>(
    escrow: &EscrowDeal,
    escrow_account: AccountInfo<'info>,
    recipient: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let seeds = &[
        b"deal".as_ref(),
        escrow.buyer.as_ref(),
        escrow.seller.as_ref(),
        &[escrow.bump],
    ];
    let signer = &[&seeds[..]];
    let cpi_ctx = CpiContext::new_with_signer(
        system_program,
        Transfer {
            from: escrow_account,
            to: recipient,
        },
        signer,
    );
    transfer(cpi_ctx, escrow.amount_lamports)?;
    Ok(())
}

#[derive(Accounts)]
#[instruction(amount_lamports: u64, description: String)]
pub struct InitializeDeal<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: Seller is a target wallet only.
    pub seller: UncheckedAccount<'info>,
    #[account(
        init,
        payer = buyer,
        space = 8 + EscrowDeal::MAX_SIZE,
        seeds = [b"deal", buyer.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub escrow_deal: Account<'info, EscrowDeal>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestCancellation<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    #[account(
        mut,
        seeds = [b"deal", escrow_deal.buyer.as_ref(), escrow_deal.seller.as_ref()],
        bump = escrow_deal.bump
    )]
    pub escrow_deal: Account<'info, EscrowDeal>,
}

#[derive(Accounts)]
pub struct SettleDeal<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    /// CHECK: seller destination wallet.
    #[account(mut)]
    pub seller: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"deal", escrow_deal.buyer.as_ref(), escrow_deal.seller.as_ref()],
        bump = escrow_deal.bump
    )]
    pub escrow_deal: Account<'info, EscrowDeal>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveRefund<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"deal", escrow_deal.buyer.as_ref(), escrow_deal.seller.as_ref()],
        bump = escrow_deal.bump
    )]
    pub escrow_deal: Account<'info, EscrowDeal>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct EscrowDeal {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub amount_lamports: u64,
    pub status: u8,
    pub created_at: i64,
    pub completed_at: i64,
    pub description: String,
    pub bump: u8,
}

impl EscrowDeal {
    pub const MAX_SIZE: usize = 32 + 32 + 8 + 1 + 8 + 8 + (4 + 256) + 1;
}

#[repr(u8)]
pub enum EscrowStatus {
    Funded = 0,
    Released = 1,
    CancelRequested = 2,
    Refunded = 3,
}

#[error_code]
pub enum EscrowError {
    #[msg("Invalid amount.")]
    InvalidAmount,
    #[msg("Description too long.")]
    DescriptionTooLong,
    #[msg("Invalid status transition.")]
    InvalidStatusTransition,
    #[msg("Unauthorized account.")]
    Unauthorized,
}
