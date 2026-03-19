import {
    Controller, Get, Post, Put, Delete, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/inventory')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class InventoryController {
    constructor(private readonly svc: InventoryService) { }

    // ─── Stock Summary ────────────────────────────────────────────────────────

    @Get('stock')
    getStockSummary(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getStockSummary(req.user.userId, cid)
    }

    // ─── Items ────────────────────────────────────────────────────────────────

    @Get('items')
    listItems(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listItems(req.user.userId, cid, q)
    }

    @Post('items')
    createItem(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createItem(req.user.userId, cid, body)
    }

    @Get('items/:itemId')
    getItem(@Req() req: any, @Param('companyId') cid: string, @Param('itemId') iid: string) {
        return this.svc.getItem(req.user.userId, cid, iid)
    }

    @Put('items/:itemId')
    updateItem(@Req() req: any, @Param('companyId') cid: string, @Param('itemId') iid: string, @Body() body: any) {
        return this.svc.updateItem(req.user.userId, cid, iid, body)
    }

    @Delete('items/:itemId')
    deleteItem(@Req() req: any, @Param('companyId') cid: string, @Param('itemId') iid: string) {
        return this.svc.deleteItem(req.user.userId, cid, iid)
    }

    // ─── Stock Locations ──────────────────────────────────────────────────────

    @Get('locations')
    listLocations(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listLocations(req.user.userId, cid)
    }

    @Post('locations')
    createLocation(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createLocation(req.user.userId, cid, body)
    }

    @Put('locations/:id')
    updateLocation(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateLocation(req.user.userId, cid, id, body)
    }

    @Delete('locations/:id')
    deleteLocation(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteLocation(req.user.userId, cid, id)
    }

    // ─── Inventory Transactions ───────────────────────────────────────────────

    @Get('transactions')
    listTransactions(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listTransactions(req.user.userId, cid, q)
    }

    @Post('transactions')
    createTransaction(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTransaction(req.user.userId, cid, body)
    }

    // ─── Fixed Assets ─────────────────────────────────────────────────────────

    @Get('assets')
    listFixedAssets(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listFixedAssets(req.user.userId, cid, q)
    }

    @Post('assets')
    createFixedAsset(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createFixedAsset(req.user.userId, cid, body)
    }

    @Get('assets/:assetId')
    getFixedAsset(@Req() req: any, @Param('companyId') cid: string, @Param('assetId') aid: string) {
        return this.svc.getFixedAsset(req.user.userId, cid, aid)
    }

    @Get('assets/:assetId/schedule')
    getDepreciationSchedule(@Req() req: any, @Param('companyId') cid: string, @Param('assetId') aid: string) {
        return this.svc.getDepreciationSchedule(req.user.userId, cid, aid)
    }

    @Post('assets/:assetId/depreciate')
    @HttpCode(HttpStatus.OK)
    runDepreciation(@Req() req: any, @Param('companyId') cid: string, @Param('assetId') aid: string, @Body() body: any) {
        return this.svc.runDepreciation(req.user.userId, cid, aid, body)
    }

    @Post('assets/:assetId/dispose')
    @HttpCode(HttpStatus.OK)
    disposeAsset(@Req() req: any, @Param('companyId') cid: string, @Param('assetId') aid: string, @Body() body: any) {
        return this.svc.disposeFixedAsset(req.user.userId, cid, aid, body)
    }

    @Put('assets/:assetId')
    updateFixedAsset(@Req() req: any, @Param('companyId') cid: string, @Param('assetId') aid: string, @Body() body: any) {
        return this.svc.updateFixedAsset(req.user.userId, cid, aid, body)
    }

    // ─── Asset Categories ─────────────────────────────────────────────────────

    @Get('asset-categories')
    listAssetCategories(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listAssetCategories(req.user.userId, cid)
    }

    @Post('asset-categories')
    createAssetCategory(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createAssetCategory(req.user.userId, cid, body)
    }

    @Put('asset-categories/:id')
    updateAssetCategory(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateAssetCategory(req.user.userId, cid, id, body)
    }

    @Delete('asset-categories/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    deleteAssetCategory(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteAssetCategory(req.user.userId, cid, id)
    }

    // ─── Units of Measure ─────────────────────────────────────────────────────

    @Get('units-of-measure')
    listUOM(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listUnitsOfMeasure(req.user.userId, cid)
    }

    @Post('units-of-measure')
    createUOM(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createUnitOfMeasure(req.user.userId, cid, body)
    }

    @Put('units-of-measure/:id')
    updateUOM(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateUnitOfMeasure(req.user.userId, cid, id, body)
    }

    // ─── Bin Locations ────────────────────────────────────────────────────────

    @Get('bin-locations')
    listBinLocations(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listBinLocations(req.user.userId, cid, q)
    }

    @Post('bin-locations')
    createBinLocation(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createBinLocation(req.user.userId, cid, body)
    }

    // ─── Physical Counts (Stock Counts) ───────────────────────────────────────

    @Get('physical-counts')
    listPhysicalCounts(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPhysicalCounts(req.user.userId, cid, q)
    }

    @Post('physical-counts')
    createPhysicalCount(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPhysicalCount(req.user.userId, cid, body)
    }

    @Get('physical-counts/:countId')
    getPhysicalCount(
        @Req() req: any, @Param('companyId') cid: string, @Param('countId') countId: string,
    ) {
        return this.svc.getPhysicalCount(req.user.userId, cid, countId)
    }

    // ─── Reorder Rules ───────────────────────────────────────────────────────

    @Get('reorder-rules')
    listReorderRules(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listReorderRules(req.user.userId, cid, q)
    }

    @Post('reorder-rules')
    createReorderRule(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createReorderRule(req.user.userId, cid, body)
    }

    @Put('reorder-rules/:id')
    updateReorderRule(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateReorderRule(req.user.userId, cid, id, body)
    }

    // ─── Backorders ───────────────────────────────────────────────────────────

    @Get('backorders')
    listBackorders(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listBackorders(req.user.userId, cid, q)
    }

    // ─── Lot / Serial Numbers ──────────────────────────────────────────────────

    @Get('lot-serial')
    listLotSerial(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listLotSerial(req.user.userId, cid, q)
    }

    @Post('lot-serial')
    createLotSerial(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createLotSerial(req.user.userId, cid, body)
    }
}
